import type { Point, Rect } from '../canvas/geometry';

export interface InkStroke {
  id: number;
  d: string;
  fading: boolean;
}

/** Everything the live "Avinash" cursor changes on the board. */
export interface Activity {
  status: string;
  typing: boolean;
  /** What the cursor label says it is doing, e.g. "editing". Empty when idle. */
  doing: string;
  chat: string | null;
  selection: Rect | null;
  ink: InkStroke[];
  /** Small displacements of sticky notes, keyed by sticky id. */
  nudges: Record<string, Point>;
  /** The sticky note currently being carried. */
  carrying: string | null;
}

export type ActivityAction =
  | { type: 'status'; text: string; typing: boolean }
  | { type: 'doing'; label: string }
  | { type: 'chat'; text: string | null }
  | { type: 'select'; rect: Rect | null }
  | { type: 'ink-add'; stroke: InkStroke }
  | { type: 'ink-fade'; id: number }
  | { type: 'ink-remove'; id: number }
  | { type: 'nudge'; id: string; offset: Point }
  | { type: 'carry'; id: string | null }
  | { type: 'reset-ui' };

export const initialActivity = (status: string): Activity => ({
  status,
  typing: false,
  doing: '',
  chat: null,
  selection: null,
  ink: [],
  nudges: {},
  carrying: null,
});

export function activityReducer(state: Activity, action: ActivityAction): Activity {
  switch (action.type) {
    case 'status':
      return { ...state, status: action.text, typing: action.typing };
    case 'doing':
      return { ...state, doing: action.label };
    case 'chat':
      return { ...state, chat: action.text };
    case 'select':
      return { ...state, selection: action.rect };
    case 'ink-add':
      return { ...state, ink: [...state.ink, action.stroke] };
    case 'ink-fade':
      return { ...state, ink: state.ink.map((s) => (s.id === action.id ? { ...s, fading: true } : s)) };
    case 'ink-remove':
      return { ...state, ink: state.ink.filter((s) => s.id !== action.id) };
    case 'nudge':
      return { ...state, nudges: { ...state.nudges, [action.id]: action.offset } };
    case 'carry':
      return { ...state, carrying: action.id };
    case 'reset-ui':
      return { ...state, doing: '', chat: null, selection: null, typing: false };
  }
}
