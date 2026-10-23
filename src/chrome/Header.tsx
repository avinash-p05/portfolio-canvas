import type { CSSProperties } from 'react';
import type { Person } from '../content/types';

const OWNER_COLOR = '#5b5bf7';
const VISITOR_COLOR = '#f0883e';

const avatarStyle = (color: string) => ({ '--c': color }) as CSSProperties;

function CursorLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3l15 8-7 2-3 7z" fill="#fff" />
    </svg>
  );
}

export function FileChip({ name }: { name: string }) {
  return (
    <div className="chrome file">
      <div className="logo">
        <CursorLogo size={14} />
      </div>
      <b>{name}</b>
      <span>/ portfolio.canvas</span>
    </div>
  );
}

interface PresenceProps {
  person: Person;
  /** The owner's cursor is busy doing something. */
  ownerActive: boolean;
  following: boolean;
  requested: boolean;
  onToggleFollow: () => void;
  onRequestAccess: () => void;
}

/** Figma-style presence: who's here, your access level, and a way to ask for more. */
export function Presence({
  person,
  ownerActive,
  following,
  requested,
  onToggleFollow,
  onRequestAccess,
}: PresenceProps) {
  const ownerClass = ['av', ownerActive && 'active', following && 'following'].filter(Boolean).join(' ');
  return (
    <div className="chrome presence">
      <div className="avatars">
        <button
          type="button"
          className={ownerClass}
          style={avatarStyle(OWNER_COLOR)}
          data-tip={`${person.name} · owner · click to ${following ? 'stop following' : 'follow'}`}
          aria-label={following ? `Stop following ${person.name}` : `Follow ${person.name}`}
          aria-pressed={following}
          onClick={onToggleFollow}
        >
          {person.initials}
          <span className="online" />
        </button>
        <span className="av" style={avatarStyle(VISITOR_COLOR)} data-tip="You · can view">
          You
        </span>
      </div>
      <span className="role-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        View only
      </span>
      <button
        type="button"
        className={requested ? 'btn primary request-btn requested' : 'btn primary request-btn'}
        onClick={onRequestAccess}
      >
        {requested ? '✓ Access requested' : 'Request edit access'}
      </button>
      <a className="btn resume-btn" href={person.resumeUrl} download>
        Résumé
      </a>
    </div>
  );
}

export { CursorLogo };
