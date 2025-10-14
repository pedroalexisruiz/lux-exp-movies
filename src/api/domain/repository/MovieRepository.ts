import { Genre, Movie } from '@domain/model';
import { Paginated } from '../model/Pagination';

export interface MovieRepository {
  getMovieDetails(movideId: string): Promise<Movie>;
  getGenres(): Promise<Genre[]>;
  getMoviesByGenre(genreId: number, page?: number): Promise<Paginated<Movie>>;
}
