import { Movie } from '../../../api/domain/model';

export interface MoviesByGenreResponseDTO {
  ok: boolean;
  data: Movie[];
}
