/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { homeLoader, movieDetailLoader, wishlistLoader, type Deps } from '@/router/loaders';

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
  it('SSR: obtiene géneros y top 3, construye moviesByGenre, no llama setData', async () => {
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

  it('Cliente con data fresca en store: devuelve store y NO llama deps', async () => {
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

  it('Cliente sin data fresca: llama deps, construye map y llama setData', async () => {
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

describe('movideDetailLoader', () => {
  it('devuelve detalle y similares filtrando la propia película', async () => {
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
    expect(data.movie.id).toBe(123);
    // Filtrado: no incluye 123
    expect(data.similarMovies.map((m: any) => m.id)).toEqual([1, 2]);
  });
});

describe('wishlistLoader', () => {
  it('SSR: window undefined -> { items: {} }', async () => {
    unsetWindow();
    const data = await wishlistLoader();
    expect(data).toEqual({ items: {} });
  });

  it('Browser con localStorage válido -> devuelve items', async () => {
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

  it('Browser con JSON inválido -> { items: {} }', async () => {
    setWindowWithLocalStorage(() => 'not-json');
    const data = await wishlistLoader();
    expect(data).toEqual({ items: {} });
  });

  it('Browser sin clave en localStorage -> { items: {} }', async () => {
    setWindowWithLocalStorage(() => null);
    const data = await wishlistLoader();
    expect(data).toEqual({ items: {} });
  });
});
