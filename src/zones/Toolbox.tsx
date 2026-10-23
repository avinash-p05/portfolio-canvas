import { Item } from '../canvas/Item';
import type { SkillCard, ZoneLabel as ZoneLabelContent } from '../content/types';
import { ZoneLabel } from './ZoneLabel';

export function Toolbox({ label, cards }: { label: ZoneLabelContent; cards: SkillCard[] }) {
  return (
    <section className="zone" data-zone="stack" aria-label="Tech stack">
      <ZoneLabel {...label} />
      {cards.map(({ groups, ...placement }) => (
        <Item key={groups[0]?.title} className="card stack" {...placement}>
          {groups.map(({ title, skills }) => (
            <div key={title}>
              <h4>{title}</h4>
              <div className="tags">
                {skills.map((skill) => (
                  <span key={skill} data-chip="">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Item>
      ))}
    </section>
  );
}
