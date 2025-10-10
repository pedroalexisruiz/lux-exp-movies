import { Genre, Movie } from '../api/domain/model';
import { useMoviesStore } from '../app/store/moviesStore';

export type Deps = {
  listGenres: () => Promise<Genre[]>;
  listMoviesByGenre: (id: number) => Promise<Movie[]>;
  getMovieDetails: (id: string) => Promise<Movie>;
};

export const homeLoader = async (deps: Deps) => {
  if (typeof window !== 'undefined' && useMoviesStore.getState().hasFreshData()) {
    const { genres, moviesByGenre } = useMoviesStore.getState();
    return { genres, moviesByGenre };
  }

  const genres = await deps.listGenres();
  const top = genres.slice(0, 3);

  const entries = await Promise.all(
    top.map(async (genre: Genre) => {
      const movies = await deps.listMoviesByGenre(genre.id);
      return [genre.id, movies] as const;
    }),
  );
  const map = Object.fromEntries(entries) as Record<number, Movie[]>;

  if (typeof window !== 'undefined') {
    useMoviesStore.getState().setData(genres, map);
  }

  return { genres, moviesByGenre: map };
};

export const movideDetailLoader = async (deps: Deps, id: string) => {
  const movie = await deps.getMovieDetails(id);
  const similarMovies = await deps.listMoviesByGenre(movie.genres[0].id);
  return { movie, similarMovies };
};
