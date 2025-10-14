import { TMDB_BASE, TMDB_KEY } from '@api/constants';
import { MovieRepository } from '@domain/repository';
import { GenreResponseDTO, MovieDTO, MoviesByGenreResponseDTO } from '@dto/index';
import { ErrorFactory, MovieFactory } from '@infrastructure/factories';
import { fetchJson } from '@infrastructure/http/customFetch';

async function tmdbAPI<T>(path: string, init?: RequestInit): Promise<T> {
  if (!TMDB_KEY) throw new Error('TMDB_KEY is not defined');
  if (!TMDB_BASE) throw new Error('TMDB_BASE is not defined');

  const separator = path.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE}${path}${separator}api_key=${TMDB_KEY}`;

  return await fetchJson<T>(url, { ...init, headers: { accept: 'application/json' } });
}

export class TmdbMovieRepository implements MovieRepository {
  async getMovieDetails(movideId: string) {
    try {
      return MovieFactory.fromDTO(await tmdbAPI<MovieDTO>(`/movie/${movideId}`));
    } catch (error) {
      throw ErrorFactory.fromErrorToDomainException(error);
    }
  }
  async getGenres() {
    try {
      return (await tmdbAPI<GenreResponseDTO>('/genre/movie/list')).genres;
    } catch (error) {
      throw ErrorFactory.fromErrorToDomainException(error);
    }
  }
  async getMoviesByGenre(genreId: number, page: number = 1) {
    try {
      const response = await tmdbAPI<MoviesByGenreResponseDTO>(
        `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`,
      );

      const items = response.results.map(MovieFactory.fromDTO);
      return {
        items,
        page: response.page ?? page,
        totalPages: response.total_pages ?? 1,
        total: response.total_results ?? items.length,
        perPage: items.length,
      };
    } catch (error) {
      throw ErrorFactory.fromErrorToDomainException(error);
    }
  }
}
