import { useEffect, useRef, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { useEngine } from './EngineContext';
import type { Point } from './geometry';
import { measureWorld } from './measure';

/** Spacing of the dot grid behind the canvas, in world pixels. */
const GRID = 24;
/** How far a press must travel before it counts as trying to drag a locked item. */
const DRAG_THRESHOLD = 6;

type Gesture =
  | { type: 'pan' }
  | { type: 'pinch'; distance: number; mid: Point }
  | { type: 'locked'; el: HTMLElement; start: Point; warned: boolean };

/** Safari reports pinch zoom through these non-standard events instead of ctrl + wheel. */
type GestureEvent = Event & { scale: number; clientX?: number; clientY?: number };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

interface BoardProps {
  worldRef: RefObject<HTMLDivElement>;
  pageView: boolean;
  /** False while a dialog is open so canvas shortcuts don't fire behind it. */
  shortcutsEnabled: boolean;
  /** The visitor moved the camera themselves (used to stop following). */
  onNavigate: () => void;
  /** The visitor tried to drag a card or note they can't edit. */
  onLockedDrag: (item: HTMLElement) => void;
  /** The visitor pressed an edit shortcut such as undo. */
  onEditShortcut: () => void;
  children: ReactNode;
}

/**
 * The pannable, zoomable surface. Handles mouse, touch, trackpad and keyboard input and applies
 * the engine's camera to the world element.
 */
export function Board({
  worldRef,
  pageView,
  shortcutsEnabled,
  onNavigate,
  onLockedDrag,
  onEditShortcut,
  children,
}: BoardProps) {
  const engine = useEngine();
  const boardRef = useRef<HTMLElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  // window listeners are bound once and read the latest props from here
  const latest = useRef({ pageView, shortcutsEnabled, onNavigate, onLockedDrag, onEditShortcut });
  latest.current = { pageView, shortcutsEnabled, onNavigate, onLockedDrag, onEditShortcut };

  useEffect(() => {
    const board = boardRef.current;
    const world = worldRef.current;
    if (!board || !world) return;
    const apply = () => {
      if (latest.current.pageView) {
        world.style.transform = '';
        board.style.backgroundSize = '';
        board.style.backgroundPosition = '';
        return;
      }
      const { x, y, z } = engine.camera;
      world.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
      board.style.backgroundSize = `${GRID * z}px ${GRID * z}px`;
      board.style.backgroundPosition = `${x}px ${y}px`;
    };
    apply();
    return engine.subscribe(apply);
  }, [engine, worldRef, pageView]);

  useEffect(() => {
    // Listen on the whole window: ctrl + scroll (and trackpad pinch, which arrives as ctrl + wheel)
    // over the header or toolbar would otherwise zoom the browser instead of the canvas.
    const onWheel = (e: WheelEvent) => {
      if (latest.current.pageView) return;
      const zooming = e.ctrlKey || e.metaKey;
      if (!zooming && (e.target as Element | null)?.closest?.('.toolbar, .modal')) return;
      e.preventDefault();
      engine.cancelFlight();
      latest.current.onNavigate();
      if (zooming) engine.zoomAt(e.clientX, e.clientY, engine.camera.z * Math.exp(-e.deltaY * 0.01));
      else engine.panBy(-e.deltaX, -e.deltaY);
    };

    let gestureStartZoom = 1;
    const onGestureStart = (e: Event) => {
      if (latest.current.pageView) return;
      e.preventDefault();
      gestureStartZoom = engine.camera.z;
    };
    const onGestureChange = (e: Event) => {
      if (latest.current.pageView) return;
      e.preventDefault();
      const g = e as GestureEvent;
      engine.zoomAt(g.clientX ?? innerWidth / 2, g.clientY ?? innerHeight / 2, gestureStartZoom * g.scale);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const { shortcutsEnabled: enabled, pageView: page } = latest.current;
      if (!enabled || page || (e.target as Element | null)?.closest?.('input, textarea')) return;
      const key = e.key;
      if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(key.toLowerCase())) {
        e.preventDefault();
        latest.current.onEditShortcut();
        return;
      }
      const pan = 80;
      if (key === '+' || key === '=') engine.zoomBy(1.2);
      else if (key === '-' || key === '_') engine.zoomBy(1 / 1.2);
      else if (key === '0' && worldRef.current) engine.flyTo(engine.fit(measureWorld(worldRef.current), 40));
      else if (key === 'ArrowLeft') engine.panBy(pan, 0);
      else if (key === 'ArrowRight') engine.panBy(-pan, 0);
      else if (key === 'ArrowUp') engine.panBy(0, pan);
      else if (key === 'ArrowDown') engine.panBy(0, -pan);
      else return;
      e.preventDefault();
      latest.current.onNavigate();
    };

    const options = { passive: false } as const;
    addEventListener('wheel', onWheel, options);
    addEventListener('gesturestart', onGestureStart, options);
    addEventListener('gesturechange', onGestureChange, options);
    addEventListener('keydown', onKeyDown);
    return () => {
      removeEventListener('wheel', onWheel);
      removeEventListener('gesturestart', onGestureStart);
      removeEventListener('gesturechange', onGestureChange);
      removeEventListener('keydown', onKeyDown);
    };
  }, [engine, worldRef]);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (pageView || e.button > 0) return;
    const target = e.target as Element;
    if (target.closest('a, button, input, textarea')) return;
    // a drag on the canvas pans; it should never start a text selection
    e.preventDefault();
    getSelection()?.removeAllRanges();
    engine.cancelFlight();
    onNavigate();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    engine.interacting = true;

    if (pointers.current.size === 1) {
      const locked = target.closest<HTMLElement>('.locked');
      if (locked) {
        gesture.current = {
          type: 'locked',
          el: locked,
          start: { x: e.clientX, y: e.clientY },
          warned: false,
        };
      } else {
        gesture.current = { type: 'pan' };
        boardRef.current?.classList.add('grabbing');
      }
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [Point, Point];
      gesture.current = { type: 'pinch', distance: distance(a, b), mid: midpoint(a, b) };
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const previous = pointers.current.get(e.pointerId);
    const g = gesture.current;
    if (!previous || !g) return;
    const point = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, point);

    if (g.type === 'pan') {
      engine.panBy(point.x - previous.x, point.y - previous.y);
    } else if (g.type === 'locked') {
      if (!g.warned && distance(point, g.start) > DRAG_THRESHOLD) {
        g.warned = true;
        onLockedDrag(g.el);
      }
    } else if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()] as [Point, Point];
      const mid = midpoint(a, b);
      const d = distance(a, b);
      engine.panBy(mid.x - g.mid.x, mid.y - g.mid.y);
      engine.zoomAt(mid.x, mid.y, (engine.camera.z * d) / g.distance);
      g.distance = d;
      g.mid = mid;
    }
  };

  const onPointerEnd = (e: PointerEvent<HTMLElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      engine.interacting = false;
      boardRef.current?.classList.remove('grabbing');
    } else if (pointers.current.size === 1 && gesture.current?.type === 'pinch') {
      gesture.current = { type: 'pan' };
    }
  };

  return (
    <main
      ref={boardRef}
      className="board"
      aria-label="Portfolio canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div ref={worldRef} className="world">
        {children}
      </div>
    </main>
  );
}
