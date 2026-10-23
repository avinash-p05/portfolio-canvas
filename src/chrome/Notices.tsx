interface ViewOnlyBarProps {
  visible: boolean;
  requested: boolean;
  onRequestAccess: () => void;
}

/** Shown when a visitor tries to edit something they can only view. */
export function ViewOnlyBar({ visible, requested, onRequestAccess }: ViewOnlyBarProps) {
  return (
    <div className={visible ? 'snack on' : 'snack'} role="status">
      <span>
        {requested
          ? '🔒 View only · your edit request is pending'
          : '🔒 You have view-only access to this canvas.'}
      </span>
      {!requested && (
        <button type="button" className="btn" onClick={onRequestAccess}>
          Request edit access
        </button>
      )}
    </div>
  );
}

/** The purple frame and banner shown while following the owner's cursor. */
export function FollowBanner({
  name,
  following,
  onStop,
}: {
  name: string;
  following: boolean;
  onStop: () => void;
}) {
  return (
    <>
      <div className="follow-frame" aria-hidden="true" />
      {following && (
        <div className="follow-bar">
          Following {name}
          <button type="button" onClick={onStop}>
            Stop
          </button>
        </div>
      )}
    </>
  );
}

export function Toast({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div className={visible ? 'toast show' : 'toast'} role="status">
      {text}
    </div>
  );
}
