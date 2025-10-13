import { screen } from '@testing-library/react';
import Home from '@app/pages/Home/Home';
import { renderWithRouter } from '../../utils/renderWithRouter';
import { Genre, Movie } from '@/api/domain/model';

describe('<Home />', () => {
  it('Should render empty movies when there is not movies by genre', async () => {
    const genre: Genre = { id: 1, name: 'Action' };
    const moviesByGenre = {
      1: [],
    };
    renderWithRouter(<Home />, {
      genres: [genre],
      moviesByGenre,
    });

    expect(await screen.findByText('There are not available movies.')).toBeInTheDocument();
  });

  it('should render Carousel movies when exists genres', async () => {
    const genre = { id: 1, name: 'Action' };
    const moviesByGenre: Record<number, Partial<Movie>[]> = {
      1: [
        {
          id: 101,
          title: 'Sample Movie',
          releaseDate: '2023-01-01',
          voteAverage: 8.5,
          posterPath: '/sample.jpg',
        },
      ],
    };
    renderWithRouter(<Home />, {
      genres: [genre],
      moviesByGenre,
    });

    expect(await screen.findByRole('heading', { name: genre.name })).toBeInTheDocument();
  });
});
