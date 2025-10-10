import './Actions.scss';

interface ActionsProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  secondaryIcon?: React.ReactNode;
  secondaryActive?: boolean;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function Actions({
  primaryLabel,
  secondaryLabel,
  secondaryIcon,
  secondaryActive,
  onPrimary,
  onSecondary,
}: ActionsProps) {
  return (
    <div className="md-actions">
      {primaryLabel && (
        <button className="md-actions__btn md-actions__btn--ghost" onClick={onPrimary}>
          {primaryLabel}
        </button>
      )}
      <button
        className={`md-actions__btn md-actions__btn--primary ${secondaryActive ? 'md-actions__btn--primary__active' : ''}`}
        onClick={onSecondary}
      >
        {secondaryIcon}
        {secondaryLabel}
      </button>
    </div>
  );
}
