import { Genre, Movie } from '@domain/model';
import { useMoviesStore } from '@store/moviesStore';

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

export const movieDetailLoader = async (deps: Deps, id: string) => {
  const movie = await deps.getMovieDetails(id);
  const similarMovies = await deps.listMoviesByGenre(movie.genres[0].id);
  const filteredSimilarMovies = similarMovies.filter((m) => m.id !== movie.id);
  return { movie, similarMovies: filteredSimilarMovies };
};

export const wishlistLoader = async () => {
  if (typeof window === 'undefined') return { items: {} };
  try {
    const raw = window.localStorage.getItem('wishlist:v1');
    const parsed = raw ? JSON.parse(raw) : null;
    const items = parsed?.state?.items ?? {};
    return { items };
  } catch {
    return { items: {} };
  }
};
