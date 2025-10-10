import './Chip.scss';

export const Chip = ({ label }: { label: string }) => {
  return (
    <li key={label} className="md-chip">
      {label}
    </li>
  );
};
