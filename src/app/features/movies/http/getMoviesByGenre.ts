import { Paginated } from '@/api/domain/model/Pagination';
import { Genre, Movie } from '@domain/model';
import { MoviesByGenreResponseDTO } from '@shared/dto/MoviesByGenreResponseDTO';
import { customFetch } from '@shared/http/clientCustomFetch';

export const getGenres = async (): Promise<Genre[]> => {
  const url = `/api/movies/genres`;
  const response = await customFetch(url);
  return response.data;
};

export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1,
): Promise<Paginated<Movie>> => {
  const url = `/api/movies/genres/${genreId}?page=${page}`;
  const response: MoviesByGenreResponseDTO = await customFetch(url);
  return response.data;
};

export const getMovieById = async (id: string): Promise<Movie> => {
  const res = await customFetch(`/api/movies/${id}`);
  return res.data as Movie;
};
