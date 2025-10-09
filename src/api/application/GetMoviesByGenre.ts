import { MovieRepository } from '../domain/repository';

export const makeGetMoviesByGenre = (repo: MovieRepository) => {
  return async function getMoviesByGenre(genreId: number) {
    return repo.getMoviesByGenre(genreId);
  };
};
