import './Actions.scss';

export function Actions({
  primaryLabel,
  onPrimary,
}: {
  primaryLabel?: string;
  onPrimary?: () => void;
}) {
  return (
    <div className="md-actions">
      {primaryLabel && (
        <button className="md-actions__btn md-actions__btn--primary" onClick={onPrimary}>
          {primaryLabel}
        </button>
      )}
      <button className="md-actions__btn md-actions__btn--ghost" aria-label="Add to whishlist">
        Add to whishlist
      </button>
    </div>
  );
}
