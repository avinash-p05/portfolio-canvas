import type { ProjectArt as ArtKind } from '../content/types';

interface ArtProps {
  ink: string;
}

const outline = (ink: string) => ({ fill: 'none', stroke: ink, strokeOpacity: 0.35, strokeWidth: 1.5 });

/** A request travelling through three services. */
function Pipeline({ ink }: ArtProps) {
  return (
    <>
      <g {...outline(ink)}>
        <rect x="40" y="40" width="70" height="36" rx="8" />
        <rect x="150" y="40" width="70" height="36" rx="8" />
        <rect x="260" y="40" width="70" height="36" rx="8" />
        <path d="M110 58h40M220 58h40" />
      </g>
      <circle r="5" fill={ink}>
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M110 58h40M220 58h40" />
      </circle>
    </>
  );
}

/** A query fanning out to sources and merging into an answer. */
function Retrieval({ ink }: ArtProps) {
  return (
    <>
      <g fill={ink} fillOpacity={0.18}>
        <circle cx="70" cy="60" r="22" />
        <circle cx="185" cy="35" r="14" />
        <circle cx="185" cy="85" r="14" />
        <circle cx="300" cy="60" r="22" />
      </g>
      <path d="M92 60L171 35M92 60L171 85M199 35L278 60M199 85L278 60" {...outline(ink)} />
      <circle r="4" fill={ink}>
        <animateMotion dur="2.2s" repeatCount="indefinite" path="M92 60L171 35L199 35L278 60" />
      </circle>
      <circle r="4" fill={ink}>
        <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path="M92 60L171 85L199 85L278 60" />
      </circle>
    </>
  );
}

/** A queue feeding three workers. */
function Workers({ ink }: ArtProps) {
  const routes = ['M100 60L160 28H220L280 60', 'M100 60H280', 'M100 60L160 92H220L280 60'];
  return (
    <>
      <g {...outline(ink)}>
        <rect x="40" y="46" width="60" height="28" rx="7" />
        <rect x="160" y="16" width="60" height="24" rx="7" />
        <rect x="160" y="48" width="60" height="24" rx="7" />
        <rect x="160" y="80" width="60" height="24" rx="7" />
        <rect x="280" y="46" width="50" height="28" rx="7" />
        <path d="M100 60L160 28M100 60H160M100 60L160 92M220 28L280 60M220 60H280M220 92L280 60" />
      </g>
      {routes.map((path, i) => (
        <circle key={path} r="4" fill={ink}>
          <animateMotion dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={path} />
        </circle>
      ))}
    </>
  );
}

/** A phone scanning a QR code. */
function Qr({ ink }: ArtProps) {
  const cells = [
    [171, 38],
    [183, 38],
    [171, 50],
    [191, 50],
    [179, 62],
    [171, 70],
    [191, 70],
  ];
  return (
    <>
      <rect x="155" y="12" width="60" height="98" rx="10" {...outline(ink)} strokeOpacity={0.4} />
      <g fill={ink} fillOpacity={0.45}>
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" />
        ))}
      </g>
      <rect x="163" y="34" width="44" height="2" fill={ink}>
        <animate attributeName="y" values="34;80;34" dur="2s" repeatCount="indefinite" />
      </rect>
    </>
  );
}

/** Mountain peaks with a flag, for the Avalanche fest. */
function Peaks({ ink }: ArtProps) {
  return (
    <>
      <g fill={ink} fillOpacity={0.5}>
        <path d="M120 92l26-46 26 46z" />
        <path d="M160 92l34-62 34 62z" />
        <path d="M210 92l24-40 24 40z" />
      </g>
      <path d="M187 43l7-13 7 13-7 3z" fill="#fff" />
    </>
  );
}

/** A globe with a sweeping clock hand. */
function Globe({ ink }: ArtProps) {
  return (
    <>
      <circle cx="185" cy="60" r="38" {...outline(ink)} strokeOpacity={0.4} />
      <path
        d="M147 60h76M185 22c-14 12-14 64 0 76M185 22c14 12 14 64 0 76"
        {...outline(ink)}
        strokeOpacity={0.3}
        strokeWidth={1.2}
      />
      <line x1="185" y1="60" x2="185" y2="32" stroke={ink} strokeWidth="2.2" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 185 60"
          to="360 185 60"
          dur="6s"
          repeatCount="indefinite"
        />
      </line>
    </>
  );
}

const ART: Record<ArtKind, (props: ArtProps) => JSX.Element> = {
  pipeline: Pipeline,
  retrieval: Retrieval,
  workers: Workers,
  qr: Qr,
  peaks: Peaks,
  globe: Globe,
};

export function ProjectArt({ art, ink }: { art: ArtKind; ink: string }) {
  const Art = ART[art];
  return (
    <svg viewBox="0 0 370 120" aria-hidden="true">
      <Art ink={ink} />
    </svg>
  );
}
