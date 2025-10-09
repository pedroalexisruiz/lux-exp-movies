import { useEffect, useState } from 'react';
import { Genre, Movie } from '../../../api/domain/model';
import { getMoviesByGenre } from '../../features/movies/http/getMoviesByGenre';
import { useLoaderData } from 'react-router';

export const useHome = () => {
  const genres = useLoaderData<Genre[]>();
  const [moviesByGenre, setMoviesByGenre] = useState<Record<number, Movie[]>>({});
  const [loading, setLoading] = useState(false);

  const getImagePath = (path?: string | null, size: 'w342' | 'w500' | 'w780' = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

  useEffect(() => {
    const fetchMovies = async () => {
      if (!genres) return;
      const topGenres = genres.slice(0, 3);
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
  }, [genres]);

  return { genres, moviesByGenre, loading, getImagePath };
};
