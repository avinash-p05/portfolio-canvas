import type { ZoneId } from '../content/types';
import type { CanvasEngine } from './engine';
import { unionRects, type Rect } from './geometry';

/**
 * Canvas items are absolutely positioned inside the world element, so their offsets are already
 * world coordinates. Every positioned item carries a `data-item` attribute and lives inside a
 * section with `data-zone`.
 */
const itemRect = (el: HTMLElement): Rect => ({
  x: el.offsetLeft,
  y: el.offsetTop,
  w: el.offsetWidth,
  h: el.offsetHeight,
});

const measureAll = (world: HTMLElement, selector: string) =>
  unionRects([...world.querySelectorAll<HTMLElement>(selector)].map(itemRect));

export const measureZone = (world: HTMLElement, zone: ZoneId) =>
  measureAll(world, `[data-zone="${zone}"] [data-item]`);

export const measureWorld = (world: HTMLElement) => measureAll(world, '[data-item]');

export const listItems = (world: HTMLElement) => [...world.querySelectorAll<HTMLElement>('[data-item]')];

/** The world-space box of any element, including nested ones like a chip inside a card. */
export function worldRectOf(el: Element, engine: CanvasEngine): Rect {
  const r = el.getBoundingClientRect();
  const topLeft = engine.toWorld({ x: r.left, y: r.top });
  return { x: topLeft.x, y: topLeft.y, w: r.width / engine.camera.z, h: r.height / engine.camera.z };
}

/** Whether an element is comfortably on screen (clear of the header and toolbar). */
export function isOnScreen(el: Element, engine: CanvasEngine): boolean {
  if (engine.camera.z < 0.3) return false;
  const r = el.getBoundingClientRect();
  return r.left > 30 && r.right < innerWidth - 30 && r.top > 80 && r.bottom < innerHeight - 100;
}
