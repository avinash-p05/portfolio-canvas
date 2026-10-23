import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { Placement } from '../content/types';
import type { Point } from './geometry';

interface ItemProps extends Placement, Omit<HTMLAttributes<HTMLElement>, 'style'> {
  as?: 'div' | 'article' | 'h2';
  /** Locked items can't be moved by visitors; trying shows the view-only prompt. */
  locked?: boolean;
  /** Extra displacement, used when the live cursor nudges a sticky note. */
  offset?: Point;
  /** True while the live cursor is carrying this item. */
  carried?: boolean;
  children: ReactNode;
}

/** Something placed on the canvas at world coordinates. */
export function Item({
  as: Tag = 'div',
  x,
  y,
  w,
  r = 0,
  locked,
  offset,
  carried,
  className,
  children,
  ...rest
}: ItemProps) {
  const style = {
    left: x + (offset?.x ?? 0),
    top: y + (offset?.y ?? 0),
    width: w,
    '--r': `${r}deg`,
  } as CSSProperties;
  const classes = ['item', locked && 'locked', carried && 'carried', className].filter(Boolean).join(' ');
  return (
    <Tag data-item="" className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}
