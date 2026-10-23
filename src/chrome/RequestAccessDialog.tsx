import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Person } from '../content/types';
import { CursorLogo } from './Header';

/** Must match the static form in index.html, which Netlify scans at deploy time. */
const FORM_NAME = 'edit-request';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface RequestAccessDialogProps {
  open: boolean;
  person: Person;
  /** The email of an earlier request from this browser, if any. */
  requestedEmail: string | null;
  onClose: () => void;
  onRequested: (email: string) => void;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string };

/**
 * A Figma-style "request edit access" dialog. Submissions go to Netlify Forms, which emails them
 * to the site owner; there is no backend of our own.
 */
export function RequestAccessDialog({
  open,
  person,
  requestedEmail,
  onClose,
  onRequested,
}: RequestAccessDialogProps) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStatus({ kind: 'idle' });
    if (!requestedEmail) setTimeout(() => emailRef.current?.focus(), 50);
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [open, requestedEmail, onClose]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!EMAIL_PATTERN.test(address)) {
      setStatus({ kind: 'error', message: 'Please enter a valid email address.' });
      emailRef.current?.focus();
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const body = new URLSearchParams({ 'form-name': FORM_NAME, email: address, note, company: honeypot });
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      setStatus({ kind: 'idle' });
      onRequested(address);
    } catch {
      setStatus({
        kind: 'error',
        message: `Couldn't send the request. You can email ${person.email} instead.`,
      });
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="request-title">
        {requestedEmail ? (
          <div className="req-done">
            <div className="check">✓</div>
            <h2 id="request-title">Request sent</h2>
            <p>
              Your request to edit <b>portfolio.canvas</b> is in {person.name.split(' ')[0]}&apos;s inbox.
              You&apos;ll hear back at <b>{requestedEmail}</b>.
            </p>
            <button type="button" className="btn primary" onClick={onClose}>
              Back to viewing
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="modal-head">
              <div className="thumb">
                <CursorLogo size={18} />
              </div>
              <div>
                <h2 id="request-title">Request edit access</h2>
                <p>portfolio.canvas · owned by {person.name}</p>
              </div>
              <button type="button" className="x" aria-label="Close" onClick={onClose}>
                ×
              </button>
            </div>
            <p hidden>
              <label>
                Leave this empty
                <input
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </p>
            <label htmlFor="request-email">Your email</label>
            <input
              id="request-email"
              ref={emailRef}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="request-note">
              Add a note <span>(optional)</span>
            </label>
            <textarea
              id="request-note"
              rows={3}
              placeholder="Loved exploring your canvas! Let's talk about…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {status.kind === 'error' && <p className="err">{status.message}</p>}
            <div className="modal-actions">
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={status.kind === 'sending'}>
                {status.kind === 'sending' ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
