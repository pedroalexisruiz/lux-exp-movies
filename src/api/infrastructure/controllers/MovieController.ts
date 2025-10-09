import { Router } from 'express';
import { TmdbMovieRepository } from '../repository';
import { makeGetMoviesByGenre, makeListGenres } from '../../application';
import { exceptionMiddleware } from '../middlewares/exceptionMiddleware';
import { asyncMiddleware } from '../middlewares/asyncMiddleware';
import { DomainException } from '../../domain/exception/DomainException';

export function makeMovieRouter() {
  const repo = new TmdbMovieRepository();
  const listGenres = makeListGenres(repo);
  const getMoviesByGenre = makeGetMoviesByGenre(repo);

  const router = Router();

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

      const data = await getMoviesByGenre(id);
      res.json({ ok: true, data });
    }),
  );

  router.use(exceptionMiddleware);
  return router;
}
