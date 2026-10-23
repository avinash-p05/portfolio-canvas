import { useCallback, useEffect, useState } from 'react';
import { prefersDarkScheme } from '../lib/media';
import { STORAGE_KEYS, storage } from '../lib/storage';

export type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const saved = storage.get(STORAGE_KEYS.theme);
  if (saved === 'light' || saved === 'dark') return saved;
  return prefersDarkScheme() ? 'dark' : 'light';
}

/** Light/dark theme, remembered per visitor and applied as `data-theme` on <html>. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      storage.set(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  return [theme, toggle];
}
