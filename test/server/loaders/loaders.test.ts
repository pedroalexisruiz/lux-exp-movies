/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_RECOMMENDED_GENRE,
  homeLoader,
  movieDetailLoader,
  wishlistLoader,
  type Deps,
} from '@/router/loaders';
import { Movie } from '@/api/domain/model';

type StoreState = {
  genres: any[];
  moviesByGenre: Record<number, any[]>;
  hasFreshData: (now?: unknown) => boolean;
  setData: (genres: any[], map: Record<number, any[]>) => void;
};
const storeState: StoreState = {
  genres: [],
  moviesByGenre: {},
  hasFreshData: vi.fn(() => false),
  setData: vi.fn((genres, map) => {
    storeState.genres = genres;
    storeState.moviesByGenre = map;
  }),
};

const defaultSuggestions = [
  { id: 1, title: 'Suggested A' },
  { id: 2, title: 'Suggested B' },
] as Movie[];

vi.mock('@/app/store/moviesStore', () => ({
  useMoviesStore: {
    getState: () => storeState,
  },
}));

const originalWindow = globalThis.window;

function setWindowWithLocalStorage(getItemImpl: () => string | null) {
  globalThis.window = {
    localStorage: {
      getItem: vi.fn().mockImplementation(getItemImpl),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 1,
    },
  } as any;
}

function unsetWindow() {
  // @ts-expect-error restore
  globalThis.window = undefined;
}

beforeEach(() => {
  storeState.genres = [];
  storeState.moviesByGenre = {};
  (storeState.hasFreshData as any).mockReset().mockReturnValue(false);
  (storeState.setData as any).mockClear();
  unsetWindow();
});

afterEach(() => {
  globalThis.window = originalWindow;
});

describe('homeLoader', () => {
  it('SSR: gets genres and top 3, builds moviesByGenre, does not call setData', async () => {
    const deps: Deps = {
      listGenres: vi.fn(async () => [
        { id: 1, name: 'G1' },
        { id: 2, name: 'G2' },
        { id: 3, name: 'G3' },
        { id: 4, name: 'G4' },
      ]),
      listMoviesByGenre: vi.fn(async (id: number) => [{ id: id * 100, title: `M${id}` } as any]),
      getMovieDetails: vi.fn() as any,
    };

    const data = await homeLoader(deps);

    expect(deps.listGenres).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(3);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(1, 1);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(2, 2);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(3, 3);

    expect(data.genres?.map((genre: any) => genre.name)).toEqual(['G1', 'G2', 'G3', 'G4']);
    expect(Object.keys(data.moviesByGenre).map(Number)).toEqual([1, 2, 3]);
    expect(data.moviesByGenre[2][0]).toEqual({ id: 200, title: 'M2' });

    expect(storeState.setData).not.toHaveBeenCalled();
  });

  it('Client with fresh data in store: returns store and does NOT call deps', async () => {
    setWindowWithLocalStorage(() => null);

    storeState.genres = [{ id: 10, name: 'Fresh' }] as any;
    storeState.moviesByGenre = { 10: [{ id: 1000, title: 'InStore' } as any] };
    (storeState.hasFreshData as any).mockReturnValue(true);

    const deps: Deps = {
      listGenres: vi.fn(async () => [{ id: 1, name: 'X' }] as any),
      listMoviesByGenre: vi.fn(async () => [{ id: 2, title: 'Y' }] as any),
      getMovieDetails: vi.fn() as any,
    };

    const data = await homeLoader(deps);

    expect(data).toEqual({
      genres: storeState.genres,
      moviesByGenre: storeState.moviesByGenre,
    });

    expect(deps.listGenres).not.toHaveBeenCalled();
    expect(deps.listMoviesByGenre).not.toHaveBeenCalled();
    expect(storeState.setData).not.toHaveBeenCalled();
  });

  it('Client without fresh data: calls deps, builds map and calls setData', async () => {
    setWindowWithLocalStorage(() => null);
    (storeState.hasFreshData as any).mockReturnValue(false);

    const deps: Deps = {
      listGenres: vi.fn(async () => [
        { id: 1, name: 'G1' },
        { id: 2, name: 'G2' },
        { id: 3, name: 'G3' },
      ]),
      listMoviesByGenre: vi.fn(async (id: number) => [{ id: id * 10, title: `T${id}` } as any]),
      getMovieDetails: vi.fn() as any,
    };

    const data = await homeLoader(deps);

    expect(deps.listGenres).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(3);
    expect(data.moviesByGenre).toEqual({
      1: [{ id: 10, title: 'T1' }],
      2: [{ id: 20, title: 'T2' }],
      3: [{ id: 30, title: 'T3' }],
    });

    expect(storeState.setData).toHaveBeenCalledTimes(1);
    expect(storeState.setData).toHaveBeenCalledWith(
      [
        { id: 1, name: 'G1' },
        { id: 2, name: 'G2' },
        { id: 3, name: 'G3' },
      ],
      {
        1: [{ id: 10, title: 'T1' }],
        2: [{ id: 20, title: 'T2' }],
        3: [{ id: 30, title: 'T3' }],
      },
    );
  });
});

describe('movieDetailLoader', () => {
  it('returns detail and similar movies filtering out the movie itself', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async (id: string) => ({
        id: Number(id),
        title: 'Detail',
        genres: [{ id: 7, name: 'Seven' }],
      })) as any,

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      listMoviesByGenre: vi.fn(async (_genreId: number) => [
        { id: 1, title: 'A' },
        { id: 2, title: 'B' },
        { id: 123, title: 'Self' },
      ]) as any,
      listGenres: vi.fn() as any,
    };

    const data = await movieDetailLoader(deps, '123');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('123');
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(7);
    expect(data.movie?.id).toBe(123);
    expect(data.similarMovies.map((m) => m.id)).toEqual([1, 2]);
  });

  it('if the movie has no genres, calls listMoviesByGenre with default genre 35 to get suggestions', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async (id: string) => ({
        id: Number(id),
        title: 'No Genres',
        genres: [],
      })) as any,

      listMoviesByGenre: vi.fn(async (genreId: number) => {
        expect(genreId).toBe(DEFAULT_RECOMMENDED_GENRE);
        return defaultSuggestions;
      }) as any,
      listGenres: vi.fn() as any,
    };

    const data = await movieDetailLoader(deps, '42');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('42');
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(DEFAULT_RECOMMENDED_GENRE);
    expect(data.movie?.id).toBe(42);
    expect(data.similarMovies).toEqual(defaultSuggestions);
  });

  it('if getMovieDetails throws error, returns movie null and calls listMoviesByGenre with default genre 35 to get suggestions', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async () => {
        throw new Error('Not found');
      }) as any,
      listMoviesByGenre: vi.fn(async (genreId: number) => {
        expect(genreId).toBe(DEFAULT_RECOMMENDED_GENRE);
        return defaultSuggestions;
      }) as any,
      listGenres: vi.fn() as any,
    };

    const data = await movieDetailLoader(deps, '999999');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('999999');
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(DEFAULT_RECOMMENDED_GENRE);
    expect(data).toEqual({ movie: null, similarMovies: defaultSuggestions });
  });

  it('if movie.genres is undefined, calls listMoviesByGenre with default genre 35 to get suggestions', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async (id: string) => ({
        id: Number(id),
        title: 'Undefined Genres',
        genres: undefined as any,
      })) as any,
      listMoviesByGenre: vi.fn(async (genreId: number) => {
        expect(genreId).toBe(DEFAULT_RECOMMENDED_GENRE);
        return defaultSuggestions;
      }) as any,
      listGenres: vi.fn() as any,
    };

    const data = await movieDetailLoader(deps, '7');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('7');
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(DEFAULT_RECOMMENDED_GENRE);
    expect(data.movie?.id).toBe(7);
    expect(data.similarMovies).toEqual(defaultSuggestions);
  });
});

describe('wishlistLoader', () => {
  it('SSR: window undefined -> { items: {} }', async () => {
    unsetWindow();
    const data = await wishlistLoader();
    expect(data).toEqual({ items: {} });
  });

  it('Browser with valid localStorage -> returns items', async () => {
    const payload = {
      state: {
        items: {
          9: { id: 9, title: 'Saved' },
        },
      },
    };
    setWindowWithLocalStorage(() => JSON.stringify(payload));

    const data = await wishlistLoader();
    expect(data).toEqual({ items: { 9: { id: 9, title: 'Saved' } } });
  });

  it('Browser with invalid JSON -> { items: {} }', async () => {
    setWindowWithLocalStorage(() => 'not-json');
    const data = await wishlistLoader();
    expect(data).toEqual({ items: {} });
  });

  it('Browser without key in localStorage -> { items: {} }', async () => {
    setWindowWithLocalStorage(() => null);
    const data = await wishlistLoader();
    expect(data).toEqual({ items: {} });
  });
});
