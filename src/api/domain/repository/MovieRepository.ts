import { Genre, Movie } from '../model';

export interface MovieRepository {
  getMovieDetails(movideId: string): Promise<Movie>;
  getGenres(): Promise<Genre[]>;
  getMoviesByGenre(genreId: number): Promise<Movie[]>;
}
