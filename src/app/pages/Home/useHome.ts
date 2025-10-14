import { useEffect } from 'react';
import { Genre, Movie } from '@domain/model';
import { useLoaderData } from 'react-router';
import { moviesStore } from '@store/moviesStore';
import { Paginated } from '@/api/domain/model/Pagination';
import { getMoviesByGenre as httpGetMoviesByGenre } from '@/app/features/movies/http/getMoviesByGenre';

export const useHome = () => {
  const data = useLoaderData<{
    genres: Genre[];
    moviesByGenre: Record<number, Paginated<Movie>>;
  }>();

  const genres = moviesStore((s) => s.genres) ?? [];
  const moviesByGenre = moviesStore((s) => s.moviesByGenre);
  const setData = moviesStore((s) => s.setData);
  const appendPage = moviesStore((s) => s.appendPage);
  const getGenrePage = moviesStore((s) => s.getGenrePage);
  const hasMore = moviesStore((s) => s.hasMore);
  const isLoading = moviesStore((s) => s.isLoading);
  const setLoading = moviesStore((s) => s.setLoading);

  useEffect(() => {
    if (typeof window !== 'undefined' && data?.genres && data?.moviesByGenre) {
      setData(data.genres, data.moviesByGenre);
    }
  }, [data, setData]);

  const loadMoreByGenre = async (genreId: number) => {
    if (isLoading(genreId)) return;
    if (!hasMore(genreId)) return;

    const nextPage = getGenrePage(genreId) + 1;

    try {
      setLoading(genreId, true);
      const pageData = await httpGetMoviesByGenre(genreId, nextPage);
      appendPage(genreId, pageData);
    } finally {
      setLoading(genreId, false);
    }
  };

  return { genres, moviesByGenre, loadMoreByGenre };
};
