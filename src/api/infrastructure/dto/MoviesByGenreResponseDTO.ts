import { MovieDTO } from './MovieDTO';

export interface MoviesByGenreResponseDTO {
  page: number;
  results: MovieDTO[];
  total_pages: number;
  total_results: number;
}
