import { Item } from '../canvas/Item';
import type { Project, ZoneLabel as ZoneLabelContent } from '../content/types';
import { ProjectArt } from './ProjectArt';
import { ZoneLabel } from './ZoneLabel';

function ProjectCard({ project }: { project: Project }) {
  const { name, kind, description, stack, links, art, gradient, ink, note, ...placement } = project;
  return (
    <Item as="article" className="card project" locked data-note={note} {...placement}>
      <div className="art" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
        <ProjectArt art={art} ink={ink} />
        <span className="kind">{kind}</span>
      </div>
      <div className="body">
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="chips">
          {stack.map((tech) => (
            <span key={tech} data-chip="">
              {tech}
            </span>
          ))}
        </div>
        <div className="links">
          {links.map(({ label, url }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              {label} ↗
            </a>
          ))}
        </div>
      </div>
    </Item>
  );
}

export function Projects({ label, projects }: { label: ZoneLabelContent; projects: Project[] }) {
  return (
    <section className="zone" data-zone="projects" aria-label="Projects">
      <ZoneLabel {...label} />
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}
