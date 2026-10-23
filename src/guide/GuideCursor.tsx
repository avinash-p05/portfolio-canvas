import { useEffect, useRef } from 'react';
import { useEngine } from '../canvas/EngineContext';
import { RichText } from '../lib/RichText';
import type { Bubble } from './useTour';

interface GuideCursorProps {
  name: string;
  visible: boolean;
  doing: string;
  chat: string | null;
  bubble: Bubble | null;
}

/** The multiplayer-style "Avinash" cursor, with its label, chat message and tour bubble. */
export function GuideCursor({ name, visible, doing, chat, bubble }: GuideCursorProps) {
  const engine = useEngine();
  const ref = useRef<HTMLDivElement>(null);

  // follows the cursor's world position without re-rendering
  useEffect(() => {
    const place = () => {
      const p = engine.toScreen(engine.guide);
      if (ref.current) ref.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    place();
    return engine.subscribe(place);
  }, [engine]);

  return (
    <div ref={ref} className={visible ? 'guide' : 'guide hidden'} aria-live="polite">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 2l16 9-7 2-3.5 7z"
          fill="#5b5bf7"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tag">
        {name}
        {doing && <em> · {doing}</em>}
      </span>
      <div className={chat && !bubble ? 'chat on' : 'chat'}>{chat}</div>
      {bubble && (
        <div className="bubble">
          <div>
            <RichText text={bubble.text} />
          </div>
          <div className="row">
            {bubble.actions.map(({ label, onClick, primary }) => (
              <button key={label} type="button" className={primary ? 'btn primary' : 'btn'} onClick={onClick}>
                {label}
              </button>
            ))}
            {bubble.progress && <span className="count">{bubble.progress}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
