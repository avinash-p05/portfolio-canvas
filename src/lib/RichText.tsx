import { Fragment } from 'react';

/** Renders content strings, turning `**text**` into bold and `\n` into line breaks. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 ? <b key={j}>{part}</b> : part))}
        </Fragment>
      ))}
    </>
  );
}
