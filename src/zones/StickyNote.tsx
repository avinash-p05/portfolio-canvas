import { Item } from '../canvas/Item';
import type { Point } from '../canvas/geometry';
import type { Sticky } from '../content/types';

interface StickyNoteProps {
  sticky: Sticky;
  offset?: Point;
  carried?: boolean;
}

export function StickyNote({ sticky, offset, carried }: StickyNoteProps) {
  const { id, color, place, title, detail, ...placement } = sticky;
  return (
    <Item
      {...placement}
      className={`sticky ${color}`}
      data-sticky={id}
      locked
      offset={offset}
      carried={carried}
    >
      <div className="place" data-highlight="">
        {place}
      </div>
      <div className="what">{title}</div>
      <div className="where">{detail || ' '}</div>
    </Item>
  );
}
