import { Router } from 'express';
import { TmdbMovieRepository } from '@repo/index';
import { makeGetMovieDetails, makeGetMoviesByGenre, makeListGenres } from '@application/index';
import { asyncMiddleware, exceptionMiddleware } from '@infrastructure/middlewares';
import { DomainException } from '@domain/exception/DomainException';
import { cacheControl } from '../middlewares/cacheMiddleware';

export function makeMovieRouter() {
  const repo = new TmdbMovieRepository();
  const listGenres = makeListGenres(repo);
  const getMoviesByGenre = makeGetMoviesByGenre(repo);
  const getMovieDetail = makeGetMovieDetails(repo);

  const router = Router();

  router.use(cacheControl({ privacy: 'public', maxAge: 60, staleWhileRevalidate: 300 }));

  router.get(
    '/genres',
    asyncMiddleware(async (_req, res) => {
      const data = await listGenres();
      res.json({ ok: true, data });
    }),
  );

  router.get(
    '/genres/:id',
    asyncMiddleware(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        throw new DomainException('InvalidArgument', 'Genre ID must be a number');

      const pageRaw = req.query.page;
      const page = pageRaw == null ? 1 : Number(pageRaw);
      if (!Number.isFinite(page) || page < 1) {
        throw new DomainException(
          'InvalidArgument',
          'Query param "page" must be a positive number',
        );
      }

      const data = await getMoviesByGenre(id, page);

      res.json({ ok: true, data });
    }),
  );

  router.get(
    '/:id',
    asyncMiddleware(async (req, res) => {
      const id = req.params.id;
      if (!id) throw new DomainException('InvalidArgument', 'Movie ID cant be empty');

      const data = await getMovieDetail(id);
      res.json({ ok: true, data });
    }),
  );

  router.use(exceptionMiddleware);

  return router;
}
