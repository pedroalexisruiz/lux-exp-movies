import { useEffect, useState } from 'react';
import './App.scss';
import { InitialState } from './app/domain/InitialState';
import { getMoviesByGenre } from './app/features/movies/http/getMoviesByGenre';
import { Genre, Movie } from './api/domain/model';
import { Carousel } from './app/shared/ui/Carousel';
import { MovieCard } from './app/features/movies/components/MovieCard';

interface AppProps {
  initialState?: InitialState;
}

function App({ initialState }: AppProps) {
  const [moviesByGenre, setMoviesByGenre] = useState<Record<number, Movie[]>>({});
  const [loading, setLoading] = useState(false);

  const img = (path?: string | null, size: 'w342' | 'w500' | 'w780' = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

  useEffect(() => {
    const fetchMovies = async () => {
      if (!initialState?.genres) return;
      const topGenres = initialState.genres.slice(0, 3);
      setLoading(true);

      const moviewsByGenres = await Promise.all(
        topGenres.map(async (genre: Genre) => {
          const movies = await getMoviesByGenre(genre.id);
          return { id: genre.id, name: genre.name, movies };
        }),
      );
      const map: Record<number, Movie[]> = {};
      moviewsByGenres.forEach(({ id, movies }) => (map[id] = movies));
      setMoviesByGenre(map);
      setLoading(false);
    };
    fetchMovies();
  }, [initialState]);

  if (!initialState || loading) return <p>Loading movies...</p>;
  return (
    <>
      {initialState.genres?.slice(0, 3).map((genre: Genre) => {
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
                autoplayMs={0}
                loop
                arrows
                height="auto"
              >
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    title={movie.title}
                    subtitle={''}
                    image={img(movie.posterPath, 'w342')}
                    onClick={() => window.location.assign(`/movie/${movie.id}`)}
                  />
                ))}
              </Carousel>
            )}
          </section>
        );
      })}
    </>
  );
}

export default App;
