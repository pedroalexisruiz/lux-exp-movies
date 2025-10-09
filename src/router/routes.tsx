import { type RouteObject } from 'react-router';
import Home from '../app/pages/Home/Home';
import { MovieDetail } from '../app/pages/MovieDetail';
import { Genre, Movie } from '../api/domain/model';
import { useMoviesStore } from '../app/store/moviesStore';

export type Deps = {
  listGenres: () => Promise<Genre[]>;
  listMoviesByGenre: (id: number) => Promise<Movie[]>;
  getMovieDetails: (id: string) => Promise<Movie>;
};

const homeLoader = async (deps: Deps) => {
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

export const makeRoutes = (deps: Deps): RouteObject[] => [
  {
    path: '/',
    element: <Home />,
    loader: () => homeLoader(deps),
    shouldRevalidate: () => !useMoviesStore.getState().hasFreshData(),
  },
  {
    path: '/home',
    element: <Home />,
    loader: () => homeLoader(deps),
  },
  {
    path: '/movie/:id',
    element: <MovieDetail />,
    loader: ({ params }) => deps.getMovieDetails(params.id!),
  },
  { path: '*', element: <p>404</p> },
];
