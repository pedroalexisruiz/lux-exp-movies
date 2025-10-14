import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { MovieDetail } from '@app/pages/MovieDetail';
import { makePage, renderWithRouter } from 'test/utils/renderWithRouter';
import { useWishlist } from '@store/whishListStore';
import { Movie } from '@/api/domain/model';

vi.mock('@shared/hooks/useScrollToTop', () => ({
  useScrollToTop: () => {},
}));

const BUTTON = {
  primary: 'Visit homepage',
  secondary: 'Add to wishlist',
} as const;

const TEXT = {
  notFound: 'Movie not found.',
  title: 'The Sample',
  tagline: 'Just a line',
  year: '2023',
  status: 'Released',
  runtime: '2h 5m',
  rating: '8.3',
  votes: '(3.2M)',
  summary: 'Summary',
  overview: 'A long synopsis…',
  noOverview: 'No synopsis available.',
  genre1: 'Action',
  genre2: 'Drama',
  genreAlt: 'Sci-Fi',
  collectionTitle: 'Collection',
  collectionName: 'Sample Collection',
  recAnother: 'Another',
} as const;

const TESTID = {
  chiplist: 'chiplist',
  collectionImgByTitle: (title: string) => `movie-card-image-${title}`,
  companies: 'company-info',
  detailLang: 'detail-Spoken Languages',
  detailCountries: 'detail-Production Countries',
  recSection: 'recommendation-section',
  recSectionLegacy: 'recommendations',
} as const;

const SELECTOR = {
  heroHeader: () => screen.getByRole('banner'),
  heroBackdrop: () => SELECTOR.heroHeader().querySelector('.md-hero__backdrop') as HTMLDivElement,
  heroPosterImg: () =>
    SELECTOR.heroHeader().querySelector('.md-hero__poster img') as HTMLImageElement,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderDetailWithLoader(loaderData: any) {
  return renderWithRouter(<MovieDetail />, loaderData);
}

function click(el: HTMLElement) {
  fireEvent.click(el);
}

const baseMovie = {
  id: 10,
  title: TEXT.title,
  backdropPath: '/b.jpg',
  posterPath: '/p.jpg',
  tagline: TEXT.tagline,
  status: TEXT.status,
  releaseDate: '2023-05-01',
  runtime: 125,
  voteAverage: 8.25,
  voteCount: 3_200_000,
  homepage: 'https://example.com',
  genres: [
    { id: 1, name: TEXT.genre1 },
    { id: 2, name: TEXT.genre2 },
  ],
  belongsToCollection: {
    name: TEXT.collectionName,
    posterPath: '/pcoll.jpg',
  },
  productionCompanies: [
    { id: 1, name: 'A', logoPath: '/a.png', originCountry: 'US' },
    { id: 2, name: 'B', logoPath: '/b.png', originCountry: 'GB' },
    { id: 3, name: 'C', logoPath: '/c.png', originCountry: 'FR' },
    { id: 4, name: 'D', logoPath: '/d.png', originCountry: 'ES' },
    { id: 5, name: 'E', logoPath: '/e.png', originCountry: 'DE' },
    { id: 6, name: 'F', logoPath: '/f.png', originCountry: 'IT' },
    { id: 7, name: 'G', logoPath: '/g.png', originCountry: 'JP' },
  ],
  spokenLanguages: [{ englishName: 'English' }, { englishName: 'Spanish' }],
  productionCountries: [{ name: 'USA' }, { name: 'Spain' }],
  overview: TEXT.overview,
};

const movieNoBackdropNoPoster = {
  ...baseMovie,
  id: 42,
  title: 'No Backdrop/Poster',
  backdropPath: null,
  posterPath: null,
  tagline: '',
  overview: '',
  genres: [{ id: 7, name: TEXT.genreAlt }],
  belongsToCollection: null,
  homepage: undefined,
};

beforeEach(() => {
  localStorage.clear();
  useWishlist.setState({ items: {} });

   
  vi.spyOn(window, 'open').mockImplementation(() => window);
});

describe('<MovieDetail /> coverage (real Zustand store)', () => {
  it('renders "Movie not found." when there is no movie in loader', async () => {
    renderDetailWithLoader({ movie: null, similarMovies: makePage([]) });
    await waitFor(() => expect(screen.getByText(TEXT.notFound)).toBeInTheDocument());
  });

  it('renders full detail and adds to wishlist', async () => {
    const similar = makePage([{ id: 99, title: TEXT.recAnother } as Movie]);
    renderDetailWithLoader({ movie: baseMovie, similarMovies: similar });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: TEXT.title })).toBeInTheDocument();
    });

    expect(screen.getByText(TEXT.tagline)).toBeInTheDocument();
    expect(screen.getByText(TEXT.year)).toBeInTheDocument();
    expect(screen.getByText(TEXT.status)).toBeInTheDocument();
    expect(screen.getByText(TEXT.runtime)).toBeInTheDocument();
    expect(screen.getByText(TEXT.rating)).toBeInTheDocument();
    expect(screen.getByText(TEXT.votes)).toBeInTheDocument();

    expect(screen.getAllByTestId(TESTID.chiplist)[0]).toBeInTheDocument();
    expect(screen.getByText(TEXT.genre1)).toBeInTheDocument();
    expect(screen.getByText(TEXT.genre2)).toBeInTheDocument();

    expect(screen.getByText(TEXT.summary)).toBeInTheDocument();
    expect(screen.getByText(TEXT.overview)).toBeInTheDocument();

    click(screen.getByRole('button', { name: BUTTON.primary }));
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    expect(useWishlist.getState().has(baseMovie.id)).toBe(false);

    click(screen.getByRole('button', { name: BUTTON.secondary }));
    await waitFor(() => {
      expect(useWishlist.getState().has(baseMovie.id)).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByText(TEXT.collectionTitle)).toBeInTheDocument();
      const collImg = screen.getByTestId(TESTID.collectionImgByTitle(TEXT.collectionName));
      expect(screen.getByText(TEXT.collectionName)).toBeInTheDocument();
      expect(collImg).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/pcoll.jpg');
      const companies = screen.getAllByTestId(TESTID.companies);
      expect(companies.length).toBe(6);
    });

    expect(screen.getByTestId(TESTID.detailLang)).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByTestId(TESTID.detailCountries)).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();

    await waitFor(() => {
      const rec =
        screen.queryByTestId(TESTID.recSection) ?? screen.getByTestId(TESTID.recSectionLegacy);
      expect(rec).toBeInTheDocument();
      expect(screen.getByText(TEXT.recAnother)).toBeInTheDocument();
    });
  });

  it('should render fallbacks', async () => {
    useWishlist.getState().add({
      id: movieNoBackdropNoPoster.id,
      title: movieNoBackdropNoPoster.title,
      posterPath: movieNoBackdropNoPoster.posterPath,
      tagline: movieNoBackdropNoPoster.tagline,
    } as unknown as Movie);

    renderDetailWithLoader({
      movie: movieNoBackdropNoPoster,
      similarMovies: makePage([]),
    });

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    const backdrop = SELECTOR.heroBackdrop();
    const posterImg = SELECTOR.heroPosterImg();

    expect(backdrop.style.backgroundImage).toContain('url("")');
    expect(posterImg.getAttribute('src')).toBe('/src/assets/cinema-placeholder.jpg');

    expect(screen.queryByText(TEXT.tagline)).not.toBeInTheDocument();
    expect(screen.getByText(TEXT.genreAlt)).toBeInTheDocument();
    expect(screen.getByText(TEXT.noOverview)).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: BUTTON.primary })).not.toBeInTheDocument();

    expect(useWishlist.getState().has(movieNoBackdropNoPoster.id)).toBe(true);

    expect(screen.queryByText(TEXT.collectionTitle)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(TESTID.recSection) ?? screen.queryByTestId(TESTID.recSectionLegacy),
    ).not.toBeInTheDocument();
  });
});
