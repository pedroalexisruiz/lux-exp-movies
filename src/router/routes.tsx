import { type RouteObject } from 'react-router';
import Home from '../app/pages/Home/Home';
import { MovieDetail } from '../app/pages/MovieDetail';
import { useMoviesStore } from '../app/store/moviesStore';
import { Deps, homeLoader, movideDetailLoader } from './loaders';

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
    loader: async ({ params }) => movideDetailLoader(deps, params.id!),
  },
  { path: '*', element: <p>404</p> },
];
