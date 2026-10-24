import { useZoomPercent } from '../canvas/EngineContext';
import type { ZoneId } from '../content/types';

const ZONES: { id: ZoneId; label: string }[] = [
  { id: 'intro', label: 'Hello' },
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'wins', label: 'Wins' },
  { id: 'stack', label: 'Toolbox' },
  { id: 'learning', label: 'Learning' },
  { id: 'contact', label: 'Contact' },
];

interface ToolbarProps {
  pageView: boolean;
  touring: boolean;
  onZone: (zone: ZoneId) => void;
  onZoom: (factor: number) => void;
  onFit: () => void;
  onToggleTour: () => void;
  onTogglePageView: () => void;
  onToggleTheme: () => void;
}

function ZoomLabel() {
  return <span className="zoom-label">{useZoomPercent()}%</span>;
}

export function Toolbar({
  pageView,
  touring,
  onZone,
  onZoom,
  onFit,
  onToggleTour,
  onTogglePageView,
  onToggleTheme,
}: ToolbarProps) {
  return (
    <nav className="chrome toolbar" aria-label="Canvas navigation">
      {/* first, so it's reachable on phones without scrolling the toolbar */}
      <button
        type="button"
        className="tb view-toggle"
        title="Switch between canvas and page view"
        onClick={onTogglePageView}
      >
        {pageView ? 'Canvas view' : 'Page view'}
      </button>
      <span className="sep" />
      {ZONES.map(({ id, label }) => (
        <button key={id} type="button" className="tb" onClick={() => onZone(id)}>
          {label}
        </button>
      ))}
      {!pageView && (
        <>
          <span className="sep" />
          <button type="button" className="tb" aria-label="Zoom out" onClick={() => onZoom(0.8)}>
            −
          </button>
          <ZoomLabel />
          <button type="button" className="tb" aria-label="Zoom in" onClick={() => onZoom(1.25)}>
            +
          </button>
          <button
            type="button"
            className="tb"
            title="Fit everything (0)"
            aria-label="Fit everything"
            onClick={onFit}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </button>
        </>
      )}
      <span className="sep" />
      {!pageView && (
        <button type="button" className={touring ? 'tb on' : 'tb'} onClick={onToggleTour}>
          ▶ Tour
        </button>
      )}
      <button type="button" className="tb" aria-label="Toggle dark mode" onClick={onToggleTheme}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </button>
    </nav>
  );
}
