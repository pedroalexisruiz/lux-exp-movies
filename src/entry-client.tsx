import './index.scss';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { makeRoutes } from './router/routes';
import { getGenres, getMovieById } from './app/features/movies/http/getMoviesByGenre';

const depsClient = {
  listGenres: () => getGenres(),
  getMovieDetails: (id: string) => getMovieById(id),
};

const router = createBrowserRouter(makeRoutes(depsClient));
hydrateRoot(document.getElementById('root')!, <RouterProvider router={router} />);
