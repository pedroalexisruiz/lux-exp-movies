import { Paginated } from '@/api/domain/model/Pagination';
import { Genre, Movie } from '@domain/model';
import { useMoviesStore } from '@store/moviesStore';

export type Deps = {
  listGenres: () => Promise<Genre[]>;
  listMoviesByGenre: (id: number, page: number) => Promise<Paginated<Movie>>;
  getMovieDetails: (id: string) => Promise<Movie>;
};

export const DEFAULT_RECOMMENDED_GENRE = 35;
export const DEFAULT_PAGE = 1;

export const homeLoader = async (deps: Deps) => {
  if (typeof window !== 'undefined' && useMoviesStore.getState().hasFreshData()) {
    const { genres, moviesByGenre } = useMoviesStore.getState();
    return { genres, moviesByGenre };
  }

  const genres = await deps.listGenres();
  const top = genres.slice(0, 3);

  const entries = await Promise.all(
    top.map(async (genre: Genre) => {
      const movies = await deps.listMoviesByGenre(genre.id, DEFAULT_PAGE);
      return [genre.id, movies] as const;
    }),
  );
  const map = Object.fromEntries(entries) as Record<number, Paginated<Movie>>;

  if (typeof window !== 'undefined') {
    useMoviesStore.getState().setData(genres, map);
  }

  return { genres, moviesByGenre: map };
};

export const movieDetailLoader = async (deps: Deps, id: string) => {
  let similarMovies: Paginated<Movie>;
  try {
    const movie = await deps.getMovieDetails(id);
    const firstGenreId = movie?.genres?.[0]?.id ?? DEFAULT_RECOMMENDED_GENRE;

    const recs = await deps.listMoviesByGenre(firstGenreId, DEFAULT_PAGE);
    const items = movie ? recs.items.filter((m) => m.id !== movie.id) : recs.items;
    similarMovies = {
      ...recs,
      items,
    };

    return { movie, similarMovies };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    similarMovies = await deps.listMoviesByGenre(DEFAULT_RECOMMENDED_GENRE, DEFAULT_PAGE);
    return { movie: null, similarMovies };
  }
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
