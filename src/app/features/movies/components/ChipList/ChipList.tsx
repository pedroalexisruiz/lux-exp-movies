import { Chip } from '../Chip/Chip';
import './ChipList.scss';

export function ChipList({ items }: { items: string[] }) {
  return (
    <ul className="md-chip-list">
      {items.map((item) => (
        <Chip key={item} label={item} />
      ))}
    </ul>
  );
}
