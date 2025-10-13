import './RecommendationSection.scss';
import { Link } from 'react-router';
import { Movie } from '@api/domain/model';
import { Carousel } from '@shared/ui/Carousel';
import { MovieCard } from '../MovieCard';
import { getImagePath } from '@utils/imagePath';
import { parseYearString } from '@/utils/stringParser';

export function RecommendationSection({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section className="md-recos" data-testid="recommendation-section">
      <h2 className="md-recos__title">{title}</h2>
      <Carousel gap={16} peek={16} arrows height="auto">
        {movies.map((m) => (
          <Link key={m.id} to={`/movie/${m.id}`} style={{ textDecoration: 'none' }}>
            <MovieCard
              title={m.title}
              subtitle={m.releaseDate ? parseYearString(m.releaseDate) : ''}
              image={getImagePath(m.posterPath)}
            />
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
