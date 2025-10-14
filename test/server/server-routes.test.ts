import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach } from 'vitest';
import { makeMovieRouter } from '@api/infrastructure/controllers';

function createApp() {
  const app = express();
  app.use('/api/movies', makeMovieRouter());
  return app;
}

describe('Movie controller', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createApp();
  });

  it('GET /api/movies/genres -> 200 and returns genres', async () => {
    const res = await request(app).get('/api/movies/genres');

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('public');
    expect(res.headers['cache-control']).toContain('max-age=60');
    expect(res.headers['cache-control']).toContain('stale-while-revalidate=300');

    expect(res.body).toEqual({
      ok: true,
      data: [
        { id: 28, name: 'Action' },
        { id: 18, name: 'Drama' },
      ],
    });
  });

  it('GET /api/movies/genres/:id -> 200 and returns paginated movies by genre (page=1 by default)', async () => {
    const res = await request(app).get('/api/movies/genres/28');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.totalPages).toBe(1);
    expect(res.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 500, title: 'Action One' }),
        expect.objectContaining({ id: 501, title: 'Action Two' }),
      ]),
    );
  });

  it('GET /api/movies/genres/:id?page=2 -> 200 and returns requested page from MSW', async () => {
    const res = await request(app).get('/api/movies/genres/28?page=2');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 500, title: 'Action One' }),
        expect.objectContaining({ id: 501, title: 'Action Two' }),
      ]),
    );
  });

  it('GET /api/movies/:id -> 200 and returns movie details', async () => {
    const res = await request(app).get('/api/movies/123');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        id: 123,
        title: 'Mocked Detail 123',
        runtime: 120,
        status: 'Released',
      }),
    );
  });

  it('GET /api/movies/genres/:id -> 400 when :id is not a number', async () => {
    const res = await request(app).get('/api/movies/genres/abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: false,
        code: expect.stringMatching(/InvalidArgument/i),
        message: expect.any(String),
      }),
    );
  });

  it('GET /api/movies/genres/:id?page=0 -> 400 when page is not positive', async () => {
    const res = await request(app).get('/api/movies/genres/28?page=0');

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: false,
        code: expect.stringMatching(/InvalidArgument/i),
        message: expect.any(String),
      }),
    );
  });

  it('GET /api/movies/genres/:id?page=xyz -> 400 when page is NaN', async () => {
    const res = await request(app).get('/api/movies/genres/28?page=xyz');

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: false,
        code: expect.stringMatching(/InvalidArgument/i),
        message: expect.any(String),
      }),
    );
  });

  it('sends cache headers on all routes', async () => {
    const [r1, r2, r3] = await Promise.all([
      request(app).get('/api/movies/genres'),
      request(app).get('/api/movies/genres/28'),
      request(app).get('/api/movies/123'),
    ]);

    for (const res of [r1, r2, r3]) {
      const cc = res.headers['cache-control'] || '';
      expect(cc).toContain('public');
      expect(cc).toContain('max-age=60');
      expect(cc).toContain('stale-while-revalidate=300');
    }
  });
});
