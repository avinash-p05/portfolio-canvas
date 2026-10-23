import { describe, expect, it } from 'vitest';
import { CanvasEngine, MAX_ZOOM, MIN_ZOOM, type Scheduler } from './engine';
import { expandRect, unionRects } from './geometry';

const viewport = { width: 1000, height: 800, top: 0, bottom: 0 };

/** A scheduler that never runs frames or timeouts unless asked to. */
function manualScheduler() {
  const timeouts: (() => void)[] = [];
  const scheduler: Scheduler = {
    now: () => 0,
    frame: () => 1,
    cancelFrame: () => undefined,
    timeout: (cb) => timeouts.push(cb),
  };
  return { scheduler, flushTimeouts: () => timeouts.splice(0).forEach((cb) => cb()) };
}

describe('CanvasEngine', () => {
  it('converts between screen and world coordinates', () => {
    const engine = new CanvasEngine(viewport, false);
    engine.camera = { x: 120, y: -40, z: 2 };
    const world = { x: 33, y: -7 };
    expect(engine.toWorld(engine.toScreen(world))).toEqual(world);
  });

  it('keeps the point under the cursor fixed when zooming', () => {
    const engine = new CanvasEngine(viewport, false);
    engine.camera = { x: 50, y: 80, z: 0.8 };
    const cursor = { x: 300, y: 260 };
    const before = engine.toWorld(cursor);
    engine.zoomAt(cursor.x, cursor.y, 1.7);
    const after = engine.toWorld(cursor);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('clamps zoom to the allowed range', () => {
    const engine = new CanvasEngine(viewport, false);
    engine.zoomAt(0, 0, 100);
    expect(engine.camera.z).toBe(MAX_ZOOM);
    engine.zoomAt(0, 0, 0.0001);
    expect(engine.camera.z).toBe(MIN_ZOOM);
  });

  it('fits a rectangle inside the viewport and centres it', () => {
    const engine = new CanvasEngine(viewport, false);
    const focus = engine.fit({ x: 0, y: 0, w: 2000, h: 400 }, 0, 10);
    expect(focus).toEqual({ cx: 1000, cy: 200, z: 0.5 });
    engine.setFocus(focus);
    expect(engine.toScreen({ x: 1000, y: 200 })).toEqual({ x: 500, y: 400 });
  });

  it('lands immediately when animation is off', async () => {
    const engine = new CanvasEngine(viewport, false);
    await engine.flyTo({ cx: 10, cy: 20, z: 2 }, 900, { x: 5, y: 6 });
    expect(engine.focus()).toEqual({ cx: 10, cy: 20, z: 2 });
    expect(engine.guide).toEqual({ x: 5, y: 6 });
  });

  it('settles a pending flight when it is cancelled', async () => {
    const { scheduler } = manualScheduler();
    const engine = new CanvasEngine(viewport, true, scheduler);
    const flight = engine.flyTo({ cx: 0, cy: 0, z: 1 }, 900);
    engine.cancelFlight();
    await expect(flight).resolves.toBeUndefined();
  });

  it('lands a flight even if animation frames never arrive', async () => {
    const { scheduler, flushTimeouts } = manualScheduler();
    const engine = new CanvasEngine(viewport, true, scheduler);
    const flight = engine.flyTo({ cx: 40, cy: 50, z: 1.5 }, 900);
    flushTimeouts();
    await flight;
    expect(engine.focus()).toEqual({ cx: 40, cy: 50, z: 1.5 });
  });

  it('notifies subscribers on every camera change', () => {
    const engine = new CanvasEngine(viewport, false);
    let calls = 0;
    const unsubscribe = engine.subscribe(() => calls++);
    engine.panBy(10, 10);
    engine.zoomBy(1.2);
    unsubscribe();
    engine.panBy(1, 1);
    expect(calls).toBe(2);
  });
});

describe('geometry', () => {
  it('unions rectangles', () => {
    expect(
      unionRects([
        { x: 0, y: 0, w: 10, h: 10 },
        { x: -5, y: 5, w: 10, h: 20 },
      ]),
    ).toEqual({ x: -5, y: 0, w: 15, h: 25 });
  });

  it('expands rectangles on both axes', () => {
    expect(expandRect({ x: 0, y: 0, w: 10, h: 10 }, 5, 2)).toEqual({ x: -5, y: -2, w: 20, h: 14 });
  });
});
