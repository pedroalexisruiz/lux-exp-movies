import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';

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
