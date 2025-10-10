import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Genre, Movie } from '../../api/domain/model';

type MoviesState = {
  genres: Genre[] | null;
  moviesByGenre: Record<number, Movie[]>;
  ts: number | null;
  setData: (genres: Genre[], by: Record<number, Movie[]>) => void;
  hasFreshData: (maxAgeMs?: number) => boolean;
};

type WithDevtools = [['zustand/devtools', never]];

const isDevtoolsEnabled = !import.meta.env.SSR && import.meta.env.DEV;

const creator: StateCreator<MoviesState, WithDevtools> = (set, get) => ({
  genres: null,
  moviesByGenre: {},
  ts: null,
  setData: (genres, moviesByGenre) => set({ genres, moviesByGenre, ts: Date.now() }),
  hasFreshData: (maxAgeMs = 5 * 60 * 1000) => {
    const { ts, genres } = get();
    if (!genres || !ts) return false;
    return Date.now() - ts < maxAgeMs;
  },
});

export const moviesStore = create<MoviesState>()(
  devtools(creator, {
    name: 'MoviesStore',
    enabled: isDevtoolsEnabled,
  }),
);

export const useMoviesStore = {
  getState: () => moviesStore.getState(),
  setState: moviesStore.setState,
};
