import { Genre, Movie } from '@domain/model';

export interface InitialState {
  genres?: Genre[];
  movie?: Movie;
}
