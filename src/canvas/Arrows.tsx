import type { Arrow } from '../content/types';

const HEAD_LENGTH = 14;
const HEAD_SPREAD = 0.5;

function arrowHead([cx, cy]: [number, number], [tx, ty]: [number, number]) {
  const angle = Math.atan2(ty - cy, tx - cx);
  const wing = (side: number) => [
    tx - HEAD_LENGTH * Math.cos(angle + side * HEAD_SPREAD),
    ty - HEAD_LENGTH * Math.sin(angle + side * HEAD_SPREAD),
  ];
  const [ax, ay] = wing(-1);
  const [bx, by] = wing(1);
  return `M${ax} ${ay} L${tx} ${ty} L${bx} ${by}`;
}

/** Hand-drawn curved arrows linking the intro to each zone. */
export function Arrows({ arrows }: { arrows: Arrow[] }) {
  return (
    <svg className="arrows" width="1" height="1" aria-hidden="true">
      {arrows.map(([from, control, to], i) => (
        <g key={i}>
          <path d={`M${from[0]} ${from[1]} Q${control[0]} ${control[1]} ${to[0]} ${to[1]}`} />
          <path d={arrowHead(control, to)} />
        </g>
      ))}
    </svg>
  );
}
