import './Home.scss';
import { Genre } from '../../../api/domain/model';
import { Carousel } from '../../shared/ui/Carousel';
import { MovieCard } from '../../features/movies/components/MovieCard';
import { Link } from 'react-router';
import { useHome } from './useHome';
import { getImagePath } from '../../utils/imagePath';

function Home() {
  const { genres, moviesByGenre } = useHome();

  return (
    <>
      {genres.slice(0, 3).map((genre: Genre) => {
        const movies = moviesByGenre[genre.id] || [];
        return (
          <section key={genre.id} style={{ marginBottom: 40 }}>
            <h2>{genre.name}</h2>

            {movies.length === 0 ? (
              <p>There are not available movies.</p>
            ) : (
              <Carousel gap={18} peek={24} loop arrows height="auto">
                {movies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    state={{ movie }}
                    style={{ textDecoration: 'none' }}
                  >
                    <MovieCard
                      title={movie.title}
                      subtitle={movie.tagline}
                      image={getImagePath(movie.posterPath, 'w342')}
                    />
                  </Link>
                ))}
              </Carousel>
            )}
          </section>
        );
      })}
    </>
  );
}

export default Home;
