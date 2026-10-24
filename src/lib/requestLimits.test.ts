import { describe, expect, it } from 'vitest';
import {
  MAX_EMAIL_LENGTH,
  MAX_NOTE_LENGTH,
  REQUEST_COOLDOWN_MS,
  cooldownRemaining,
  describeWait,
  validateRequest,
} from './requestLimits';

describe('validateRequest', () => {
  it('accepts a normal email with or without a note', () => {
    expect(validateRequest('priya@acme.io', '')).toBeNull();
    expect(validateRequest('priya@acme.io', 'Loved the canvas!')).toBeNull();
  });

  it('rejects malformed emails', () => {
    for (const email of ['', 'priya', 'priya@acme', 'pri ya@acme.io', '@acme.io']) {
      expect(validateRequest(email, '')).toMatch(/valid email/);
    }
  });

  it('rejects emails longer than the RFC limit', () => {
    const long = `${'a'.repeat(MAX_EMAIL_LENGTH)}@acme.io`;
    expect(validateRequest(long, '')).toMatch(/valid email/);
  });

  it('rejects notes over the length limit', () => {
    expect(validateRequest('priya@acme.io', 'x'.repeat(MAX_NOTE_LENGTH))).toBeNull();
    expect(validateRequest('priya@acme.io', 'x'.repeat(MAX_NOTE_LENGTH + 1))).toMatch(/under 500/);
  });
});

describe('cooldownRemaining', () => {
  const sentAt = 1_000_000;

  it('allows a request when nothing was sent before', () => {
    expect(cooldownRemaining(null, sentAt)).toBe(0);
    expect(cooldownRemaining(Number.NaN, sentAt)).toBe(0);
  });

  it('blocks requests during the cooldown', () => {
    expect(cooldownRemaining(sentAt, sentAt + 1000)).toBe(REQUEST_COOLDOWN_MS - 1000);
  });

  it('allows requests once the cooldown has passed', () => {
    expect(cooldownRemaining(sentAt, sentAt + REQUEST_COOLDOWN_MS)).toBe(0);
  });
});

describe('describeWait', () => {
  it('rounds up to whole minutes', () => {
    expect(describeWait(20_000)).toBe('a minute');
    expect(describeWait(61_000)).toBe('2 minutes');
    expect(describeWait(REQUEST_COOLDOWN_MS)).toBe('10 minutes');
  });
});
