import { clamp, easeInOutCubic, type Focus, type Point, type Rect } from './geometry';

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 2.5;

export interface Camera {
  /** Screen position of the world origin. */
  x: number;
  y: number;
  /** Zoom level; 1 means one world pixel per screen pixel. */
  z: number;
}

/** The visible screen, minus the space taken by the header (top) and toolbar (bottom). */
export interface Viewport {
  width: number;
  height: number;
  top: number;
  bottom: number;
}

/** Timing functions, injectable so the engine can be tested without a browser. */
export interface Scheduler {
  now(): number;
  frame(cb: (time: number) => void): number;
  cancelFrame(id: number): void;
  timeout(cb: () => void, ms: number): unknown;
}

const browserScheduler: Scheduler = {
  now: () => performance.now(),
  frame: (cb) => requestAnimationFrame(cb),
  cancelFrame: (id) => cancelAnimationFrame(id),
  timeout: (cb, ms) => setTimeout(cb, ms),
};

/**
 * Owns the camera of the infinite canvas and the position of the guide cursor.
 *
 * It is deliberately framework-free: React components subscribe to it and apply the camera to
 * the DOM directly, so panning and flying never re-render the component tree.
 */
export class CanvasEngine {
  camera: Camera = { x: 0, y: 0, z: 1 };
  /** World position of the "Avinash" cursor. */
  guide: Point = { x: -280, y: -190 };
  /** True while the visitor is pressing on the canvas. */
  interacting = false;

  private listeners = new Set<() => void>();
  private flightId = 0;
  private frameId = 0;
  private settleFlight: (() => void) | null = null;

  constructor(
    private viewport: Viewport,
    private animate = true,
    private scheduler: Scheduler = browserScheduler,
  ) {}

  setViewport(viewport: Viewport) {
    this.viewport = viewport;
    this.emit();
  }

  setAnimate(animate: boolean) {
    this.animate = animate;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  toScreen(p: Point): Point {
    const { x, y, z } = this.camera;
    return { x: p.x * z + x, y: p.y * z + y };
  }

  toWorld(p: Point): Point {
    const { x, y, z } = this.camera;
    return { x: (p.x - x) / z, y: (p.y - y) / z };
  }

  /** The part of the world currently on screen. */
  visibleRect(): Rect {
    const topLeft = this.toWorld({ x: 0, y: 0 });
    return {
      x: topLeft.x,
      y: topLeft.y,
      w: this.viewport.width / this.camera.z,
      h: this.viewport.height / this.camera.z,
    };
  }

  panBy(dx: number, dy: number) {
    this.camera = { ...this.camera, x: this.camera.x + dx, y: this.camera.y + dy };
    this.emit();
  }

  /** Zoom while keeping the world point under (sx, sy) fixed on screen. */
  zoomAt(sx: number, sy: number, zoom: number) {
    const z = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const anchor = this.toWorld({ x: sx, y: sy });
    this.camera = { x: sx - anchor.x * z, y: sy - anchor.y * z, z };
    this.emit();
  }

  zoomBy(factor: number) {
    this.zoomAt(this.viewport.width / 2, this.viewport.height / 2, this.camera.z * factor);
  }

  /** The world point at the centre of the usable area, and the current zoom. */
  focus(): Focus {
    const { width, height, top, bottom } = this.viewport;
    const c = this.toWorld({ x: width / 2, y: top + (height - top - bottom) / 2 });
    return { cx: c.x, cy: c.y, z: this.camera.z };
  }

  setFocus({ cx, cy, z }: Focus) {
    const { width, height, top, bottom } = this.viewport;
    this.camera = { x: width / 2 - cx * z, y: top + (height - top - bottom) / 2 - cy * z, z };
    this.emit();
  }

  /** The focus that fits `rect` inside the usable area with `pad` pixels to spare. */
  fit(rect: Rect, pad = 60, maxZoom = 1.1): Focus {
    const { width, height, top, bottom } = this.viewport;
    const usableH = height - top - bottom;
    const z = clamp(
      Math.min((width - pad * 2) / rect.w, (usableH - pad * 2) / rect.h, maxZoom),
      MIN_ZOOM,
      MAX_ZOOM,
    );
    return { cx: rect.x + rect.w / 2, cy: rect.y + rect.h / 2, z };
  }

  /**
   * Animate the camera to `target`, optionally moving the guide cursor along with it.
   * Resolves when the flight lands or is interrupted by another flight or `cancelFlight()`.
   */
  flyTo(target: Focus, duration = 900, guideTo?: Point): Promise<void> {
    this.cancelFlight();
    return new Promise((resolve) => {
      const id = ++this.flightId;
      this.settleFlight = resolve;
      const land = () => {
        this.setFocus(target);
        if (guideTo) this.guide = { ...guideTo };
        this.emit();
        this.settleFlight = null;
        resolve();
      };
      if (!this.animate || duration <= 0) {
        land();
        return;
      }

      const from = this.focus();
      const guideFrom = { ...this.guide };
      const start = this.scheduler.now();
      const step = (now: number) => {
        if (id !== this.flightId) return;
        const t = Math.min((now - start) / duration, 1);
        const e = easeInOutCubic(t);
        // interpolate zoom in log space so zooming in and out feel equally fast
        const z = Math.exp(Math.log(from.z) + (Math.log(target.z) - Math.log(from.z)) * e);
        if (guideTo) {
          this.guide = {
            x: guideFrom.x + (guideTo.x - guideFrom.x) * e,
            y: guideFrom.y + (guideTo.y - guideFrom.y) * e,
          };
        }
        this.setFocus({
          cx: from.cx + (target.cx - from.cx) * e,
          cy: from.cy + (target.cy - from.cy) * e,
          z,
        });
        if (t < 1) {
          this.frameId = this.scheduler.frame(step);
        } else {
          this.flightId++;
          this.settleFlight = null;
          resolve();
        }
      };
      this.frameId = this.scheduler.frame(step);
      // background tabs pause animation frames; land anyway so nothing waits forever
      this.scheduler.timeout(() => {
        if (id !== this.flightId) return;
        this.scheduler.cancelFrame(this.frameId);
        this.flightId++;
        land();
      }, duration + 300);
    });
  }

  cancelFlight() {
    if (this.frameId) this.scheduler.cancelFrame(this.frameId);
    this.frameId = 0;
    this.flightId++;
    const settle = this.settleFlight;
    this.settleFlight = null;
    settle?.();
  }

  /** Animate only the guide cursor. `abort` is checked every frame. */
  moveGuide(to: Point, duration = 900, abort: () => boolean = () => false): Promise<void> {
    return new Promise((resolve) => {
      const from = { ...this.guide };
      const start = this.scheduler.now();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      if (!this.animate || duration <= 0) {
        this.guide = { ...to };
        this.emit();
        finish();
        return;
      }
      const step = (now: number) => {
        if (done) return;
        if (abort()) return finish();
        const t = Math.min((now - start) / duration, 1);
        const e = easeInOutCubic(t);
        this.guide = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
        this.emit();
        if (t < 1) this.scheduler.frame(step);
        else finish();
      };
      this.scheduler.frame(step);
      this.scheduler.timeout(() => {
        if (!done && !abort()) {
          this.guide = { ...to };
          this.emit();
        }
        finish();
      }, duration + 250);
    });
  }
}
