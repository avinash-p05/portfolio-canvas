import { Item } from '../canvas/Item';
import type { Certifications, Education, ZoneLabel as ZoneLabelContent } from '../content/types';
import { ZoneLabel } from './ZoneLabel';

interface LearningProps {
  label: ZoneLabelContent;
  education: Education;
  certifications: Certifications;
}

export function Learning({ label, education, certifications }: LearningProps) {
  const { degree, period, score, scoreLabel, school, ...eduPlacement } = education;
  const { items, ...certPlacement } = certifications;
  return (
    <section className="zone" data-zone="learning" aria-label="Education and certifications">
      <ZoneLabel {...label} />
      <Item className="card edu" {...eduPlacement}>
        <h5>
          {degree} · {period}
        </h5>
        <div className="big" data-highlight="">
          {score} <small>{scoreLabel}</small>
        </div>
        <p>{school}</p>
      </Item>
      <Item className="card" {...certPlacement}>
        <h5>Certifications</h5>
        <ul className="certs">
          {items.map(({ name, issuer }) => (
            <li key={name}>
              {name}
              <span>{issuer}</span>
            </li>
          ))}
        </ul>
      </Item>
    </section>
  );
}
