import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export const movieHandlers = [
  http.get(`${TMDB_BASE}/genre/movie/list`, () => {
    return HttpResponse.json({
      genres: [
        { id: 28, name: 'Action' },
        { id: 18, name: 'Drama' },
      ],
    });
  }),

  http.get(`${TMDB_BASE}/discover/movie`, ({ request }) => {
    const url = new URL(request.url);
    const withGenres = url.searchParams.get('with_genres');
    const page = Number(url.searchParams.get('page') || '1');

    if (withGenres === '28') {
      return HttpResponse.json({
        page,
        total_pages: 1,
        total_results: 2,
        results: [
          { id: 500, title: 'Action One', poster_path: '/a1.jpg', genre_ids: [28] },
          { id: 501, title: 'Action Two', poster_path: '/a2.jpg', genre_ids: [28] },
        ],
      });
    }

    return HttpResponse.json({
      page,
      total_pages: 1,
      total_results: 1,
      results: [{ id: 600, title: 'Generic Movie', poster_path: '/g.jpg', genre_ids: [18] }],
    });
  }),

  http.get(`${TMDB_BASE}/movie/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      title: id === '123' ? 'Mocked Detail 123' : 'Mocked Detail',
      backdrop_path: '/bd.jpg',
      poster_path: '/p.jpg',
      genres: [{ id: 28, name: 'Action' }],
      release_date: '2024-01-01',
      runtime: 120,
      vote_average: 8.1,
      vote_count: 1234,
      spoken_languages: [{ english_name: 'English' }],
      production_countries: [{ iso_3166_1: 'US', name: 'United States of America' }],
      production_companies: [{ id: 77, name: 'ACME', origin_country: 'US', logo_path: null }],
      status: 'Released',
      tagline: 'Boom!',
      overview: 'Some overview…',
    });
  }),
];

export const server = setupServer(...movieHandlers);
