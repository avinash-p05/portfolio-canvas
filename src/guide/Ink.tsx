import type { Rect } from '../canvas/geometry';
import type { InkStroke } from './activity';

/** Pen strokes and selection boxes drawn by the live cursor, in world coordinates. */
export function Ink({
  strokes,
  selection,
  name,
}: {
  strokes: InkStroke[];
  selection: Rect | null;
  name: string;
}) {
  return (
    <>
      <svg className="ink" width="1" height="1" aria-hidden="true">
        {strokes.map(({ id, d, fading }) => (
          <path key={id} d={d} pathLength={1} className={fading ? 'fading' : undefined} />
        ))}
      </svg>
      <div
        className={selection ? 'ap-select on' : 'ap-select'}
        data-label={name}
        aria-hidden="true"
        style={
          selection
            ? { left: selection.x, top: selection.y, width: selection.w, height: selection.h }
            : undefined
        }
      />
    </>
  );
}
