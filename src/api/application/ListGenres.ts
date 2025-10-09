import { MovieRepository } from '../domain/repository';

export const makeListGenres = (repo: MovieRepository) => {
  return async function listGenres() {
    return repo.getGenres();
  };
};
