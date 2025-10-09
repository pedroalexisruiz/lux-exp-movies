import { Genre, Movie } from '../../api/domain/model';

export interface InitialState {
  genres?: Genre[];
  movie?: Movie;
}
