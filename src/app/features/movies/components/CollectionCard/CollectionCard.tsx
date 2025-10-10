import './CollectionCard.scss';
import { MovieCard } from '../MovieCard';

export function CollectionCard({ title, image }: { title: string; image: string }) {
  return (
    <div className="md-collection__card">
      <MovieCard title={title} image={image} />
    </div>
  );
}
