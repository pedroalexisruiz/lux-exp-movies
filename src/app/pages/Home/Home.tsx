import './Home.scss';
import { Genre } from '../../../api/domain/model';
import { Carousel } from '../../shared/ui/Carousel';
import { MovieCard } from '../../features/movies/components/MovieCard';
import { Link } from 'react-router';
import { useHome } from './useHome';

function Home() {
  const { genres, moviesByGenre, loading, getImagePath: img } = useHome();

  if (loading) return <p>Loading movies...</p>;
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
              <Carousel
                responsive={[
                  { max: 375, slidesToShow: 1 },
                  { min: 376, max: 479, slidesToShow: 2 },
                  { min: 480, max: 767, slidesToShow: 3 },
                  { min: 768, max: 919, slidesToShow: 5 },
                  { min: 920, max: 1239, slidesToShow: 5 },
                  { min: 1240, slidesToShow: 8 },
                ]}
                gap={18}
                peek={24}
                loop
                arrows
                height="auto"
              >
                {movies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    state={{ movie }}
                    style={{ textDecoration: 'none' }}
                  >
                    <MovieCard
                      title={movie.title}
                      subtitle={''}
                      image={img(movie.posterPath, 'w342')}
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
