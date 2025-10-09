import { Movie } from '../../../../api/domain/model';
import { MoviesByGenreResponseDTO } from '../../../shared/dto/MoviesByGenreResponseDTO';
import { customFetch } from '../../../shared/http/clientCustomFetch';

export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  const url = `/api/movies/genres/${genreId}`;
  const response: MoviesByGenreResponseDTO = await customFetch(url);
  return response.data;
};
