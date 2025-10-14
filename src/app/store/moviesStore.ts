import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Genre, Movie } from '@domain/model';
import { Paginated } from '@/api/domain/model/Pagination';
import { mergePaginatedMovies } from './mergePaginated';

type MoviesState = {
  genres: Genre[] | null;
  moviesByGenre: Record<number, Paginated<Movie>>;
  ts: number | null;
  loadingByGenre: Record<number, boolean>;
  setData: (genres: Genre[], by: Record<number, Paginated<Movie>>) => void;
  appendPage: (genreId: number, pageData: Paginated<Movie>) => void;
  isLoading: (genreId: number) => boolean;
  setLoading: (genreId: number, value: boolean) => void;
  hasFreshData: (maxAgeMs?: number) => boolean;
  getGenrePage: (genreId: number) => number;
  hasMore: (genreId: number) => boolean;
};

type WithDevtools = [['zustand/devtools', never]];

const isDevtoolsEnabled = !import.meta.env.SSR && import.meta.env.DEV;

const MAX_AGE_MS = 5 * 60 * 1000;

const creator: StateCreator<MoviesState, WithDevtools> = (set, get) => ({
  genres: null,
  moviesByGenre: {},
  ts: null,
  loadingByGenre: {},
  setData: (genres, moviesByGenre) => set({ genres, moviesByGenre, ts: Date.now() }),
  appendPage: (genreId, pageData) =>
    set((s) => {
      const current = s.moviesByGenre[genreId];
      return {
        moviesByGenre: {
          ...s.moviesByGenre,
          [genreId]: mergePaginatedMovies(current, pageData),
        },
        ts: Date.now(),
      };
    }),
  isLoading: (genreId) => !!get().loadingByGenre[genreId],
  setLoading: (genreId, value) =>
    set((s) => ({
      loadingByGenre: { ...s.loadingByGenre, [genreId]: value },
    })),
  hasFreshData: (maxAgeMs = MAX_AGE_MS) => {
    const { ts, genres } = get();
    if (!genres || !ts) return false;
    return Date.now() - ts < maxAgeMs;
  },
  getGenrePage: (genreId) => get().moviesByGenre[genreId]?.page ?? 1,
  hasMore: (genreId) => {
    const g = get().moviesByGenre[genreId];
    if (!g) return false;
    return g.page < g.totalPages;
  },
});

export const moviesStore = create<MoviesState>()(
  devtools(creator, { name: 'MoviesStore', enabled: isDevtoolsEnabled }),
);

export const useMoviesStore = {
  getState: () => moviesStore.getState(),
  setState: moviesStore.setState,
};
