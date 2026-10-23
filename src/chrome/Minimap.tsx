import { useEffect, useRef, type MouseEvent, type RefObject } from 'react';
import { useEngine } from '../canvas/EngineContext';
import { expandRect, type Rect } from '../canvas/geometry';
import { listItems, measureWorld } from '../canvas/measure';

const WIDTH = 360;
const HEIGHT = 232;
const MARGIN = 120;

interface Projection {
  bounds: Rect;
  scale: number;
  offset: { x: number; y: number };
}

/** A small overview of the whole board; click anywhere on it to jump there. */
export function Minimap({ worldRef, theme }: { worldRef: RefObject<HTMLElement>; theme: string }) {
  const engine = useEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projection = useRef<Projection | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let queued = false;

    const draw = () => {
      queued = false;
      const world = worldRef.current;
      if (!world || getComputedStyle(canvas.parentElement ?? canvas).display === 'none') return;
      const styles = getComputedStyle(document.documentElement);
      const bounds = expandRect(measureWorld(world), MARGIN);
      const scale = Math.min(WIDTH / bounds.w, HEIGHT / bounds.h);
      const offset = { x: (WIDTH - bounds.w * scale) / 2, y: (HEIGHT - bounds.h * scale) / 2 };
      projection.current = { bounds, scale, offset };
      const tx = (x: number) => offset.x + (x - bounds.x) * scale;
      const ty = (y: number) => offset.y + (y - bounds.y) * scale;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      for (const el of listItems(world)) {
        ctx.fillStyle = el.classList.contains('sticky')
          ? getComputedStyle(el).backgroundColor
          : styles.getPropertyValue('--line');
        ctx.fillRect(tx(el.offsetLeft), ty(el.offsetTop), el.offsetWidth * scale, el.offsetHeight * scale);
      }
      const view = engine.visibleRect();
      ctx.strokeStyle = styles.getPropertyValue('--accent');
      ctx.lineWidth = 3;
      ctx.strokeRect(tx(view.x), ty(view.y), view.w * scale, view.h * scale);
    };

    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(draw);
    };
    draw();
    return engine.subscribe(queue);
  }, [engine, worldRef, theme]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const p = projection.current;
    const canvas = canvasRef.current;
    if (!p || !canvas) return;
    const r = canvas.getBoundingClientRect();
    const px = ((e.clientX - r.left) * WIDTH) / r.width;
    const py = ((e.clientY - r.top) * HEIGHT) / r.height;
    void engine.flyTo(
      {
        cx: p.bounds.x + (px - p.offset.x) / p.scale,
        cy: p.bounds.y + (py - p.offset.y) / p.scale,
        z: engine.camera.z,
      },
      500,
    );
  };

  return (
    <div className="chrome minimap" title="Click to jump" onClick={onClick}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
