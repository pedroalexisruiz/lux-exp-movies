import { useEffect } from 'react';
import { Genre, Movie } from '../../../api/domain/model';
import { useLoaderData } from 'react-router';
import { useMoviesStore } from '../../store/moviesStore';

export const useHome = () => {
  const data = useLoaderData<{ genres: Genre[]; moviesByGenre: Record<number, Movie[]> }>();
  const genres = data?.genres || [];
  const setData = useMoviesStore.getState().setData;
  const moviesByGenre = data?.moviesByGenre || {};

  useEffect(() => {
    if (typeof window !== 'undefined' && data?.genres && data?.moviesByGenre) {
      setData(data.genres, data.moviesByGenre);
    }
  }, [data, setData]);

  return { genres, moviesByGenre };
};
