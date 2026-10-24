import { useState } from 'react';
import { Item } from '../canvas/Item';
import type { Contact as ContactContent, Person, ZoneLabel as ZoneLabelContent } from '../content/types';
import { ZoneLabel } from './ZoneLabel';

/** A postage stamp with the owner's photo, or their initials if there's no photo yet. */
function Stamp({ person }: { person: Person }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  if (!person.photo || photoFailed) return <div className="stamp">{person.initials}</div>;
  return (
    <div className="stamp photo">
      <img src={person.photo} alt={person.name} draggable={false} onError={() => setPhotoFailed(true)} />
    </div>
  );
}

interface ContactProps {
  label: ZoneLabelContent;
  contact: ContactContent;
  person: Person;
  onCopyEmail: () => void;
}

export function Contact({ label, contact, person, onCopyEmail }: ContactProps) {
  const { message, detail, ...placement } = contact;
  return (
    <section className="zone" data-zone="contact" aria-label="Contact">
      <ZoneLabel {...label} />
      <Item className="card postcard" {...placement}>
        <div className="msg">
          {message}
          <small>{detail}</small>
        </div>
        <div className="divider" />
        <div className="addr">
          <Stamp person={person} />
          <button type="button" onClick={onCopyEmail} title="Copy email">
            {person.email}
          </button>
          {person.links.map(({ label: linkLabel, url }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              {linkLabel}
            </a>
          ))}
          <a href={person.resumeUrl} download>
            résumé.pdf ↓
          </a>
        </div>
      </Item>
    </section>
  );
}
