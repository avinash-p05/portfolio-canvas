import type { CSSProperties } from 'react';
import type { Annotation } from '../content/types';

export function Note({ x, y, r = 0, text }: Annotation) {
  const style: CSSProperties = { left: x, top: y, transform: `rotate(${r}deg)` };
  return (
    <div className="note" style={style}>
      {text}
    </div>
  );
}

export function Annotations({ notes }: { notes: Annotation[] }) {
  return (
    <>
      {notes.map((note) => (
        <Note key={note.text} {...note} />
      ))}
    </>
  );
}
