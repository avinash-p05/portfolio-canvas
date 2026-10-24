/**
 * Client-side limits on edit requests. They stop accidental repeats and junk payloads; real spam
 * filtering happens on Netlify (honeypot field plus Akismet), since anything in the browser can
 * be bypassed.
 */

/** The longest valid email address (RFC 5321). */
export const MAX_EMAIL_LENGTH = 254;
export const MAX_NOTE_LENGTH = 500;
/** Minimum time between two requests from the same browser. */
export const REQUEST_COOLDOWN_MS = 10 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns a message describing what's wrong, or null if the request can be sent. */
export function validateRequest(email: string, note: string): string | null {
  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return 'Please enter a valid email address.';
  }
  if (note.length > MAX_NOTE_LENGTH) {
    return `Please keep the note under ${MAX_NOTE_LENGTH} characters.`;
  }
  return null;
}

/** Milliseconds until another request is allowed, or 0 if one can be sent now. */
export function cooldownRemaining(lastSentAt: number | null, now: number): number {
  if (lastSentAt === null || !Number.isFinite(lastSentAt)) return 0;
  return Math.max(0, lastSentAt + REQUEST_COOLDOWN_MS - now);
}

export function describeWait(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  return minutes <= 1 ? 'a minute' : `${minutes} minutes`;
}
