import { type RouteObject } from 'react-router';
import Home from '../app/pages/Home/Home';
import { MovieDetail } from '../app/pages/MovieDetail';
import { useMoviesStore } from '../app/store/moviesStore';
import { Deps, homeLoader, movideDetailLoader, wishlistLoader } from './loaders';
import { Wishlist } from '../app/pages/WishList/WishList';
import { AppLayout } from '../app/layout/AppLayout/AppLayout';

export const makeRoutes = (deps: Deps): RouteObject[] => [
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
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
      {
        path: '/wishlist',
        element: <Wishlist />,
        loader: wishlistLoader,
        shouldRevalidate: () => false,
      },
      { path: '*', element: <p>404</p> },
    ],
  },
];
