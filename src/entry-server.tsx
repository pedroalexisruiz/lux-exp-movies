import { renderToString } from 'react-dom/server';
import { TmdbMovieRepository } from '@infrastructure/repository';
import { makeListGenres, makeGetMovieDetails } from '@application/index';
import {
  createStaticHandler,
  createStaticRouter,
  StaticHandlerContext,
  StaticRouterProvider,
} from 'react-router';
import { makeRoutes } from '@router/routes';
import { Deps } from '@router/loaders';

export async function render(
  url: string,
  { req }: { req: Request; res: Response },
): Promise<{ html: string }> {
  const repo = new TmdbMovieRepository();
  const deps: Deps = {
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
