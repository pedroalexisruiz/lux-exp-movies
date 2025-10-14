import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';
import type { Movie } from '@/api/domain/model';
import type { Paginated } from '@/api/domain/model/Pagination';

export function renderWithRouter(
  element: React.ReactElement,
  loaderData: unknown = {},
  path = '/',
) {
  const routes = [
    {
      path,
      element,
      loader: async () => loaderData,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });

  return render(<RouterProvider router={router} />);
}

export function makePage(
  items: Partial<Movie>[],
  page: number = 1,
  totalPages: number = 1,
  total: number = items.length,
  perPage: number = items.length,
): Paginated<Movie> {
  return {
    items: items as Movie[],
    page,
    totalPages,
    total,
    perPage,
  };
}
