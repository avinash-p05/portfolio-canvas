import { Item } from '../canvas/Item';
import { techIcons } from '../content/techIcons';
import type { SkillCard, ZoneLabel as ZoneLabelContent } from '../content/types';
import { ZoneLabel } from './ZoneLabel';

function Skill({ name }: { name: string }) {
  const icon = techIcons[name];
  return (
    <span data-chip="">
      {icon && (
        <img
          className={icon.mono ? 'tech-icon mono' : 'tech-icon'}
          src={icon.src}
          alt=""
          height={16}
          draggable={false}
        />
      )}
      {name}
    </span>
  );
}

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
                  <Skill key={skill} name={skill} />
                ))}
              </div>
            </div>
          ))}
        </Item>
      ))}
    </section>
  );
}
