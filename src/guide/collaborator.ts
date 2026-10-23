import type { Dispatch } from 'react';
import type { CanvasEngine } from '../canvas/engine';
import { clamp, type Point } from '../canvas/geometry';
import { isOnScreen, worldRectOf } from '../canvas/measure';
import { isNarrow, sleep } from '../lib/media';
import type { Activity, ActivityAction } from './activity';

/** What the collaborator actions need from the app. */
export interface CollaboratorContext {
  engine: CanvasEngine;
  world: HTMLElement;
  dispatch: Dispatch<ActivityAction>;
  activity: () => Activity;
  statusLines: string[];
  /** Whether the cursor may act right now (no tour, dialog or drag in progress). */
  canAct: () => boolean;
  /** While followed, the cursor works anywhere and the camera rides along. */
  isFollowed: () => boolean;
}

type CollaboratorAction = (ctx: CollaboratorContext) => Promise<boolean>;

const pick = <T>(items: T[]): T | undefined => items[Math.floor(Math.random() * items.length)];
const jitter = (amount: number) => (Math.random() * 2 - 1) * amount;

/** Candidates for an action: anything on screen, or anywhere while followed. */
function candidates(ctx: CollaboratorContext, selector: string): HTMLElement[] {
  const all = [...ctx.world.querySelectorAll<HTMLElement>(selector)];
  return ctx.isFollowed() ? all : all.filter((el) => isOnScreen(el, ctx.engine));
}

/** Move the cursor to `point` near `el`; while followed, fly the camera there too. */
async function goTo(ctx: CollaboratorContext, el: Element, point: Point) {
  if (!ctx.isFollowed()) {
    await ctx.engine.moveGuide(point, 900, () => !ctx.canAct());
    return;
  }
  const r = worldRectOf(el, ctx.engine);
  const fit = ctx.engine.fit(r, 90, isNarrow() ? 0.75 : 0.95);
  await ctx.engine.flyTo({ cx: r.x + r.w / 2, cy: r.y + r.h / 2, z: fit.z }, 1100, point);
}

const retype: CollaboratorAction = async (ctx) => {
  const el = candidates(ctx, '[data-status]')[0];
  if (!el) return false;
  const r = worldRectOf(el, ctx.engine);
  await goTo(ctx, el, { x: r.x + r.w - 4, y: r.y + r.h * 0.6 });
  if (!ctx.canAct()) return true;

  ctx.dispatch({ type: 'doing', label: 'editing' });
  const original = ctx.activity().status;
  const lines = ctx.statusLines;
  const next = lines[(lines.indexOf(original) + 1) % lines.length] ?? original;
  let text = original;
  while (text.length) {
    text = text.slice(0, -1);
    ctx.dispatch({ type: 'status', text, typing: true });
    await sleep(28);
  }
  for (const ch of next) {
    text += ch;
    ctx.dispatch({ type: 'status', text, typing: true });
    await sleep(55 + Math.random() * 70);
  }
  await sleep(700);
  ctx.dispatch({ type: 'status', text, typing: false });
  ctx.dispatch({ type: 'doing', label: '' });
  return true;
};

const comment: CollaboratorAction = async (ctx) => {
  const el = pick(candidates(ctx, '[data-note]'));
  const note = el?.dataset.note;
  if (!el || !note) return false;
  const r = worldRectOf(el, ctx.engine);
  await goTo(ctx, el, { x: r.x + r.w * 0.62, y: r.y + r.h * 0.3 });
  if (!ctx.canAct()) return true;

  ctx.dispatch({ type: 'doing', label: 'commenting' });
  ctx.dispatch({ type: 'chat', text: note });
  await sleep(3200);
  ctx.dispatch({ type: 'chat', text: null });
  ctx.dispatch({ type: 'doing', label: '' });
  return true;
};

/** Sticky notes drift around their home spot but never wander off. */
const MAX_NUDGE = { x: 60, y: 50 };

const nudge: CollaboratorAction = async (ctx) => {
  const el = pick(candidates(ctx, '[data-sticky]'));
  const id = el?.dataset.sticky;
  if (!el || !id) return false;
  const r = worldRectOf(el, ctx.engine);
  await goTo(ctx, el, { x: r.x + r.w * 0.5, y: r.y + 26 });
  if (!ctx.canAct()) return true;

  ctx.dispatch({ type: 'doing', label: 'moving' });
  ctx.dispatch({ type: 'carry', id });
  const current = ctx.activity().nudges[id] ?? { x: 0, y: 0 };
  const next = {
    x: clamp(current.x + jitter(45), -MAX_NUDGE.x, MAX_NUDGE.x),
    y: clamp(current.y + jitter(35), -MAX_NUDGE.y, MAX_NUDGE.y),
  };
  ctx.dispatch({ type: 'nudge', id, offset: next });
  const guide = ctx.engine.guide;
  await ctx.engine.moveGuide({ x: guide.x + next.x - current.x, y: guide.y + next.y - current.y }, 900);
  await sleep(250);
  ctx.dispatch({ type: 'carry', id: null });
  ctx.dispatch({ type: 'doing', label: '' });
  return true;
};

const select: CollaboratorAction = async (ctx) => {
  const el = pick(candidates(ctx, '[data-chip]'));
  if (!el) return false;
  const r = worldRectOf(el, ctx.engine);
  await goTo(ctx, el, { x: r.x + r.w - 6, y: r.y + r.h - 4 });
  if (!ctx.canAct()) return true;

  ctx.dispatch({ type: 'doing', label: 'selecting' });
  ctx.dispatch({ type: 'select', rect: { x: r.x - 4, y: r.y - 4, w: r.w + 8, h: r.h + 8 } });
  await sleep(1900);
  ctx.dispatch({ type: 'select', rect: null });
  ctx.dispatch({ type: 'doing', label: '' });
  return true;
};

let strokeId = 0;

/** Points on a slightly wobbly ellipse around a rectangle, like a quick pen circle. */
function circlePoints(cx: number, cy: number, rx: number, ry: number): Point[] {
  return Array.from({ length: 15 }, (_, i) => {
    const angle = -Math.PI * 0.9 + (i / 13) * Math.PI * 2;
    const wobble = 1 + (Math.random() - 0.5) * 0.08;
    return { x: cx + Math.cos(angle) * rx * wobble, y: cy + Math.sin(angle) * ry * wobble };
  });
}

const circle: CollaboratorAction = async (ctx) => {
  const el = pick(candidates(ctx, '[data-highlight]'));
  if (!el) return false;
  const r = worldRectOf(el, ctx.engine);
  const points = circlePoints(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 16, r.h / 2 + 12);
  const [first, ...rest] = points as [Point, ...Point[]];
  await goTo(ctx, el, first);
  if (!ctx.canAct()) return true;

  ctx.dispatch({ type: 'doing', label: 'drawing' });
  const id = ++strokeId;
  const d = 'M' + points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L');
  ctx.dispatch({ type: 'ink-add', stroke: { id, d, fading: false } });
  for (const p of rest) await ctx.engine.moveGuide(p, 70);
  ctx.dispatch({ type: 'doing', label: '' });
  setTimeout(() => ctx.dispatch({ type: 'ink-fade', id }), 2600);
  setTimeout(() => ctx.dispatch({ type: 'ink-remove', id }), 3300);
  return true;
};

const ACTIONS: CollaboratorAction[] = [retype, comment, nudge, select, circle];

/** When nothing is on screen to work on, drift somewhere near the middle of the view. */
async function wander(ctx: CollaboratorContext) {
  const view = ctx.engine.visibleRect();
  await ctx.engine.moveGuide(
    { x: view.x + view.w * (0.3 + Math.random() * 0.4), y: view.y + view.h * (0.3 + Math.random() * 0.4) },
    1400,
    () => !ctx.canAct(),
  );
}

/**
 * Runs the collaborator until `isRunning` returns false. Each round tries the actions in turn
 * and performs the first one that has something on screen to work with.
 */
export async function runCollaborator(ctx: CollaboratorContext, isRunning: () => boolean) {
  let next = 0;
  while (isRunning()) {
    await sleep(ctx.isFollowed() ? 700 + Math.random() * 700 : 1800 + Math.random() * 2200);
    if (!isRunning() || !ctx.canAct() || document.hidden) continue;
    let acted = false;
    for (let tries = 0; tries < ACTIONS.length && !acted; tries++) {
      const action = ACTIONS[next++ % ACTIONS.length];
      if (action) acted = await action(ctx);
    }
    if (!acted && ctx.canAct()) await wander(ctx);
  }
}
