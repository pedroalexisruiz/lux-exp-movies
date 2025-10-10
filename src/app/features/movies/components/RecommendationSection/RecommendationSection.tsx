import './RecommendationSection.scss';
import { Link } from 'react-router';
import { Movie } from '../../../../../api/domain/model';
import { Carousel } from '../../../../shared/ui/Carousel';
import { MovieCard } from '../MovieCard';
import { getImagePath } from '../../../../utils/imagePath';

export function RecommendationSection({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section className="md-recos">
      <h2 className="md-recos__title">{title}</h2>
      <Carousel gap={16} peek={16} arrows height="auto">
        {movies.map((m) => (
          <Link key={m.id} to={`/movie/${m.id}`} style={{ textDecoration: 'none' }}>
            <MovieCard title={m.title} image={getImagePath(m.posterPath)} />
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
