import { screen } from '@testing-library/react';
import Home from '@app/pages/Home/Home';
import { makePage, renderWithRouter } from '../../utils/renderWithRouter';
import type { Genre, Movie } from '@/api/domain/model';
import type { Paginated } from '@/api/domain/model/Pagination';

describe('<Home />', () => {
  it('renders empty state when there are no movies for the genre', async () => {
    const genre: Genre = { id: 1, name: 'Action' };
    const moviesByGenre: Record<number, Paginated<Movie>> = {
      1: makePage([]),
    };

    renderWithRouter(<Home />, {
      genres: [genre],
      moviesByGenre,
    });

    expect(await screen.findByText('There are not available movies.')).toBeInTheDocument();
  });

  it('renders Carousel with movies when genres exist', async () => {
    const genre: Genre = { id: 1, name: 'Action' };
    const moviesByGenre: Record<number, Paginated<Movie>> = {
      1: makePage([
        {
          id: 101,
          title: 'Sample Movie',
          releaseDate: '2023-01-01',
          voteAverage: 8.5,
          posterPath: '/sample.jpg',
        },
      ]),
    };

    renderWithRouter(<Home />, {
      genres: [genre],
      moviesByGenre,
    });

    expect(await screen.findByRole('heading', { name: genre.name })).toBeInTheDocument();
  });
});
