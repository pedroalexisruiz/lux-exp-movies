import { Paginated } from '@/api/domain/model/Pagination';
import { Movie } from '@domain/model';

export interface MoviesByGenreResponseDTO {
  ok: boolean;
  data: Paginated<Movie>;
}
