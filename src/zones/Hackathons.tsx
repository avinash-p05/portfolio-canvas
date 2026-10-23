import type { Point } from '../canvas/geometry';
import type { Sticky, ZoneLabel as ZoneLabelContent } from '../content/types';
import { StickyNote } from './StickyNote';
import { ZoneLabel } from './ZoneLabel';

interface HackathonsProps {
  label: ZoneLabelContent;
  wins: Sticky[];
  offsets: Record<string, Point>;
  carried: string | null;
}

export function Hackathons({ label, wins, offsets, carried }: HackathonsProps) {
  return (
    <section className="zone" data-zone="wins" aria-label="Hackathon wins">
      <ZoneLabel {...label} />
      <div className="wins-grid">
        {wins.map((win) => (
          <StickyNote key={win.id} sticky={win} offset={offsets[win.id]} carried={carried === win.id} />
        ))}
      </div>
    </section>
  );
}
