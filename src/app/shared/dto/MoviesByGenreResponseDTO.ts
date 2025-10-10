import { Movie } from '@domain/model';

export interface MoviesByGenreResponseDTO {
  ok: boolean;
  data: Movie[];
}
