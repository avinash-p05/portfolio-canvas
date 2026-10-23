import { Note } from '../canvas/Annotations';
import { Item } from '../canvas/Item';
import type { Annotation, Intro as IntroContent } from '../content/types';
import { RichText } from '../lib/RichText';

interface IntroProps {
  intro: IntroContent;
  startHere: Annotation;
  /** The status pill text; the live cursor retypes it. */
  status: string;
  typing: boolean;
  resumeUrl: string;
  onSeeWork: () => void;
}

export function Intro({ intro, startHere, status, typing, resumeUrl, onSeeWork }: IntroProps) {
  const { headline, body, tags, ...placement } = intro;
  return (
    <section className="zone" data-zone="intro" aria-label="Introduction">
      <Note {...startHere} />
      <Item as="article" className="card intro" {...placement}>
        <span className={typing ? 'status typing' : 'status'} data-status="">
          <span className="status-text">{status}</span>
        </span>
        <h1>
          <RichText text={headline.before} />
          <span>{headline.highlight}</span>
          {headline.after}
        </h1>
        <p>
          <RichText text={body} />
        </p>
        <div className="hello-tags">
          {tags.map((tag) => (
            <span key={tag} data-chip="">
              {tag}
            </span>
          ))}
        </div>
        <div className="intro-actions">
          <button className="btn primary" onClick={onSeeWork}>
            See my work →
          </button>
          <a className="btn" href={resumeUrl} download>
            Résumé ↓
          </a>
        </div>
      </Item>
    </section>
  );
}
