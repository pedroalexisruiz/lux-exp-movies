import { type RouteObject } from 'react-router';
import Home from '../app/pages/Home/Home';
import { MovieDetail } from '../app/pages/MovieDetail';
import { Genre, Movie } from '../api/domain/model';

export type Deps = {
  listGenres: () => Promise<Genre[]>;
  getMovieDetails: (id: string) => Promise<Movie>;
};

export const makeRoutes = (deps: Deps): RouteObject[] => [
  {
    path: '/',
    element: <Home />,
    loader: () => deps.listGenres(),
  },
  {
    path: '/home',
    element: <Home />,
    loader: () => deps.listGenres(),
  },
  {
    path: '/movie/:id',
    element: <MovieDetail />,
    loader: ({ params }) => deps.getMovieDetails(params.id!),
  },
  { path: '*', element: <p>404</p> },
];
