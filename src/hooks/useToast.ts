import { useCallback, useEffect, useRef, useState } from 'react';

/** A short-lived message. The text stays rendered while it fades out. */
export function useToast(duration = 1800) {
  const [toast, setToast] = useState({ text: '', visible: false });
  const timer = useRef<number>();

  const show = useCallback(
    (text: string) => {
      setToast({ text, visible: true });
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show };
}
