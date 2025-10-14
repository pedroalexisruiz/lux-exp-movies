import './index.scss';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { makeRoutes } from '@router/routes';
import { getGenres, getMovieById, getMoviesByGenre } from '@features/movies/http/getMoviesByGenre';
import { Deps } from '@router/loaders';

const depsClient: Deps = {
  listGenres: () => getGenres(),
  listMoviesByGenre: (genreId: number, page: number = 1) => getMoviesByGenre(genreId, page),
  getMovieDetails: (id: string) => getMovieById(id),
};

const router = createBrowserRouter(makeRoutes(depsClient));
hydrateRoot(document.getElementById('root')!, <RouterProvider router={router} />);
