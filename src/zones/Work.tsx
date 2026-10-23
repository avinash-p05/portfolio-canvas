import { Item } from '../canvas/Item';
import type { Point } from '../canvas/geometry';
import type { Experience, Sticky, ZoneLabel as ZoneLabelContent } from '../content/types';
import { RichText } from '../lib/RichText';
import { StickyNote } from './StickyNote';
import { ZoneLabel } from './ZoneLabel';

interface WorkProps {
  label: ZoneLabelContent;
  experience: Experience[];
  highlight: Sticky;
  highlightOffset?: Point;
  highlightCarried: boolean;
}

export function Work({ label, experience, highlight, highlightOffset, highlightCarried }: WorkProps) {
  return (
    <section className="zone" data-zone="work" aria-label="Experience">
      <ZoneLabel {...label} />
      {experience.map(({ company, role, period, bullets, metrics, note, ...placement }) => (
        <Item key={company} as="article" className="card xp" data-note={note} {...placement}>
          <div className="company">
            <h3>{company}</h3>
            <span className="when" data-highlight="">
              {period}
            </span>
          </div>
          <p className="role">{role}</p>
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>
                <RichText text={bullet} />
              </li>
            ))}
          </ul>
          <div className="metric-row">
            {metrics.map(({ value, label: metricLabel }) => (
              <div key={value} data-highlight="">
                <b>{value}</b>
                <span>{metricLabel}</span>
              </div>
            ))}
          </div>
        </Item>
      ))}
      <StickyNote sticky={highlight} offset={highlightOffset} carried={highlightCarried} />
    </section>
  );
}
