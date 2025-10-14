import { Button } from '@/app/shared/ui/Carousel/Button/Button';
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
        <Button variant="ghost" onClick={onPrimary}>
          {primaryLabel}
        </Button>
      )}
      <Button active={secondaryActive} onClick={onSecondary}>
        {secondaryIcon}
        {secondaryLabel}
      </Button>
    </div>
  );
}
