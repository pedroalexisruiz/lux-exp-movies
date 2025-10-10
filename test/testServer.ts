import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('*/api/movies/genres/:id', () => {
    return HttpResponse.json([{ id: 1, title: 'Mocked' }]);
  }),
);
