import { Movie } from '@domain/model';
import { MovieDTO } from '@dto/index';
import { CaseFactory } from './CaseFactory';

export const MovieFactory = {
  fromDTO(dto: MovieDTO): Movie {
    return CaseFactory.fromApi<MovieDTO, Movie>(dto);
  },
};
