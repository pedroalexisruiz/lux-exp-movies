import { renderToString } from 'react-dom/server';
import { TmdbMovieRepository } from './api/infrastructure/repository';
import { makeListGenres } from './api/application';
import {
  createStaticHandler,
  createStaticRouter,
  StaticHandlerContext,
  StaticRouterProvider,
} from 'react-router';
import { makeGetMovieDetails } from './api/application/GetMovieDetails';
import { makeRoutes } from './router/routes';

export async function render(
  url: string,
  { req }: { req: Request; res: Response },
): Promise<{ html: string }> {
  const repo = new TmdbMovieRepository();
  const deps = {
    listGenres: makeListGenres(repo),
    listMoviesByGenre: (genreId: number) => repo.getMoviesByGenre(genreId),
    getMovieDetails: (id: string) => makeGetMovieDetails(repo)(id),
  };
  const routes = makeRoutes(deps);
  const handler = createStaticHandler(routes);
  const result = await handler.query(new Request(`http://x${url}`, { method: req.method }));

  if (result instanceof Response) {
    throw result;
  }

  const context: StaticHandlerContext = result;
  const router = createStaticRouter(routes, context);
  const html = renderToString(<StaticRouterProvider router={router} context={context} />);
  return { html };
}
