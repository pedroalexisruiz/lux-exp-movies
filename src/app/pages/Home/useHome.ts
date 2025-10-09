import { useEffect } from 'react';
import { Genre, Movie } from '../../../api/domain/model';
import { useLoaderData } from 'react-router';
import { useMoviesStore } from '../../store/moviesStore';

export const useHome = () => {
  const data = useLoaderData<{ genres: Genre[]; moviesByGenre: Record<number, Movie[]> }>();
  const genres = data?.genres || [];
  const setData = useMoviesStore.getState().setData;
  const moviesByGenre = data?.moviesByGenre || {};

  const getImagePath = (path?: string | null, size: 'w342' | 'w500' | 'w780' = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

  useEffect(() => {
    if (typeof window !== 'undefined' && data?.genres && data?.moviesByGenre) {
      setData(data.genres, data.moviesByGenre);
    }
  }, [data, setData]);

  return { genres, moviesByGenre, getImagePath };
};
