/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_RECOMMENDED_GENRE,
  DEFAULT_PAGE,
  homeLoader,
  movieDetailLoader,
  wishlistLoader,
  type Deps,
} from '@/router/loaders';
import { Movie } from '@/api/domain/model';
import type { Paginated } from '@/api/domain/model/Pagination';
import { makePage } from 'test/utils/renderWithRouter';

type StoreState = {
  genres: any[] | null;
  moviesByGenre: Record<number, Paginated<Movie>>;
  hasFreshData: (now?: unknown) => boolean;
  setData: (genres: any[], map: Record<number, Paginated<Movie>>) => void;
};

const storeState: StoreState = {
  genres: null,
  moviesByGenre: {},
  hasFreshData: vi.fn(() => false),
  setData: vi.fn((genres, map) => {
    storeState.genres = genres;
    storeState.moviesByGenre = map;
  }),
};

const defaultSuggestions = makePage([
  { id: 1, title: 'Suggested A' } as Movie,
  { id: 2, title: 'Suggested B' } as Movie,
]);

vi.mock('@store/moviesStore', () => ({
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
  storeState.genres = null;
  storeState.moviesByGenre = {};
  (storeState.hasFreshData as any).mockReset().mockReturnValue(false);
  (storeState.setData as any).mockClear();
  unsetWindow();
});

afterEach(() => {
  globalThis.window = originalWindow;
});

describe('homeLoader', () => {
  it('SSR: fetches genres and top 3, builds moviesByGenre paginated and does not call setData', async () => {
    const deps: Deps = {
      listGenres: vi.fn(async () => [
        { id: 1, name: 'G1' },
        { id: 2, name: 'G2' },
        { id: 3, name: 'G3' },
        { id: 4, name: 'G4' },
      ]),
      listMoviesByGenre: vi.fn(async (id: number, page: number) =>
        makePage([{ id: id * 100, title: `M${id}` }], page, 10, 200, 1),
      ),
      getMovieDetails: vi.fn(),
    };

    const data = await homeLoader(deps);

    expect(deps.listGenres).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(3);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(1, 1, DEFAULT_PAGE);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(2, 2, DEFAULT_PAGE);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(3, 3, DEFAULT_PAGE);

    expect(data.genres?.map((g: any) => g.name)).toEqual(['G1', 'G2', 'G3', 'G4']);
    expect(Object.keys(data.moviesByGenre).map(Number)).toEqual([1, 2, 3]);
    expect(data.moviesByGenre[2].items[0]).toEqual({ id: 200, title: 'M2' });

    expect(storeState.setData).not.toHaveBeenCalled();
  });

  it('Client with fresh store data: returns store and does not call deps', async () => {
    setWindowWithLocalStorage(() => null);

    storeState.genres = [{ id: 10, name: 'Fresh' }];
    storeState.moviesByGenre = {
      10: makePage([{ id: 1000, title: 'InStore' }]),
    };
    (storeState.hasFreshData as any).mockReturnValue(true);

    const deps: Deps = {
      listGenres: vi.fn(async () => [{ id: 1, name: 'X' }]),
      listMoviesByGenre: vi.fn(async () => makePage([{ id: 2, title: 'Y' }])),
      getMovieDetails: vi.fn(),
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

  it('Client without fresh data: calls deps, builds paginated map and calls setData', async () => {
    setWindowWithLocalStorage(() => null);
    (storeState.hasFreshData as any).mockReturnValue(false);

    const deps: Deps = {
      listGenres: vi.fn(async () => [
        { id: 1, name: 'G1' },
        { id: 2, name: 'G2' },
        { id: 3, name: 'G3' },
      ]),
      listMoviesByGenre: vi.fn(async (id: number, page: number) =>
        makePage([{ id: id * 10, title: `T${id}` }], page, 10, 200, 1),
      ),
      getMovieDetails: vi.fn(),
    };

    const data = await homeLoader(deps);

    expect(deps.listGenres).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(3);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(1, 1, DEFAULT_PAGE);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(2, 2, DEFAULT_PAGE);
    expect(deps.listMoviesByGenre).toHaveBeenNthCalledWith(3, 3, DEFAULT_PAGE);

    expect(data.moviesByGenre).toEqual({
      1: makePage([{ id: 10, title: 'T1' }], DEFAULT_PAGE, 10, 200, 1),
      2: makePage([{ id: 20, title: 'T2' }], DEFAULT_PAGE, 10, 200, 1),
      3: makePage([{ id: 30, title: 'T3' }], DEFAULT_PAGE, 10, 200, 1),
    });

    expect(storeState.setData).toHaveBeenCalledTimes(1);
    expect(storeState.setData).toHaveBeenCalledWith(
      [
        { id: 1, name: 'G1' },
        { id: 2, name: 'G2' },
        { id: 3, name: 'G3' },
      ],
      {
        1: makePage([{ id: 10, title: 'T1' }], DEFAULT_PAGE, 10, 200, 1),
        2: makePage([{ id: 20, title: 'T2' }], DEFAULT_PAGE, 10, 200, 1),
        3: makePage([{ id: 30, title: 'T3' }], DEFAULT_PAGE, 10, 200, 1),
      },
    );
  });
});

describe('movieDetailLoader', () => {
  it('returns detail and paginated similar movies filtering out itself', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async (id: string) => ({
        id: Number(id),
        title: 'Detail',
        genres: [{ id: 7, name: 'Seven' }],
      })) as any,

       
      listMoviesByGenre: vi.fn(async (_genreId: number, page: number) =>
        makePage(
          [
            { id: 1, title: 'A' },
            { id: 2, title: 'B' },
            { id: 123, title: 'Self' },
          ],
          page,
          5,
          100,
          3,
        ),
      ),
      listGenres: vi.fn(),
    };

    const data = await movieDetailLoader(deps, '123');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('123');
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(7, DEFAULT_PAGE);
    expect(data.movie?.id).toBe(123);
    expect(data.similarMovies.items.map((m) => m.id)).toEqual([1, 2]);
    expect(data.similarMovies.page).toBe(DEFAULT_PAGE);
    expect(data.similarMovies.totalPages).toBe(5);
  });

  it('if movie has no genres, uses default genre and returns paginated similar movies', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async (id: string) => ({
        id: Number(id),
        title: 'No Genres',
        genres: [],
      })) as any,
      listMoviesByGenre: vi.fn(async (genreId: number, page: number) => {
        expect(genreId).toBe(DEFAULT_RECOMMENDED_GENRE);
        expect(page).toBe(DEFAULT_PAGE);
        return defaultSuggestions;
      }),
      listGenres: vi.fn(),
    };

    const data = await movieDetailLoader(deps, '42');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('42');
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(DEFAULT_RECOMMENDED_GENRE, DEFAULT_PAGE);
    expect(data.movie?.id).toBe(42);
    expect(data.similarMovies).toEqual(defaultSuggestions);
  });

  it('if getMovieDetails throws, returns movie null and uses default genre', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async () => {
        throw new Error('Not found');
      }),
      listMoviesByGenre: vi.fn(async (genreId: number, page: number) => {
        expect(genreId).toBe(DEFAULT_RECOMMENDED_GENRE);
        expect(page).toBe(DEFAULT_PAGE);
        return defaultSuggestions;
      }),
      listGenres: vi.fn(),
    };

    const data = await movieDetailLoader(deps, '999999');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('999999');
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(DEFAULT_RECOMMENDED_GENRE, DEFAULT_PAGE);
    expect(data).toEqual({ movie: null, similarMovies: defaultSuggestions });
  });

  it('if movie.genres is undefined, uses default genre and returns paginated similar movies', async () => {
    const deps: Deps = {
      getMovieDetails: vi.fn(async (id: string) => ({
        id: Number(id),
        title: 'Undefined Genres',
        genres: undefined,
      })) as any,
      listMoviesByGenre: vi.fn(async (genreId: number, page: number) => {
        expect(genreId).toBe(DEFAULT_RECOMMENDED_GENRE);
        expect(page).toBe(DEFAULT_PAGE);
        return defaultSuggestions;
      }),
      listGenres: vi.fn(),
    };

    const data = await movieDetailLoader(deps, '7');

    expect(deps.getMovieDetails).toHaveBeenCalledWith('7');
    expect(deps.listMoviesByGenre).toHaveBeenCalledTimes(1);
    expect(deps.listMoviesByGenre).toHaveBeenCalledWith(DEFAULT_RECOMMENDED_GENRE, DEFAULT_PAGE);
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
