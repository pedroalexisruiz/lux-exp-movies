import { MovieRepository } from '@domain/repository';
import { Movie } from '../domain/model';
import { Paginated } from '../domain/model/Pagination';

export const makeGetMoviesByGenre = (repo: MovieRepository) => {
  return async function getMoviesByGenre(
    genreId: number,
    page: number = 1,
  ): Promise<Paginated<Movie>> {
    return repo.getMoviesByGenre(genreId, page);
  };
};
