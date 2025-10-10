import { MovieRepository } from '../domain/repository';

export const makeGetMovieDetails = (repo: MovieRepository) => {
  return async function getMovieDetail(movideId: string) {
    return repo.getMovieDetails(movideId);
  };
};
