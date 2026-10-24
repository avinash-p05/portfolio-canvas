/** Keys for the small amount of per-visitor state the site remembers. */
export const STORAGE_KEYS = {
  theme: 'theme',
  view: 'view',
  toured: 'toured',
  requested: 'requested',
  lastRequestAt: 'lastRequestAt',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** localStorage that never throws (private windows and blocked storage just forget). */
export const storage = {
  get(key: StorageKey): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: StorageKey, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage unavailable; the site still works, it just won't remember
    }
  },
};
