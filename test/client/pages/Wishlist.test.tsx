import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from 'test/utils/renderWithRouter';
import { Wishlist } from '@/app/pages/WishList/WishList';
import { useWishlist } from '@store/whishListStore';
import { Movie } from '@/api/domain/model';

describe('<Wishlist /> con store real', () => {
  beforeEach(() => {
    localStorage.clear();
    useWishlist.setState({ items: {} });
  });

  it('muestra vacío', async () => {
    renderWithRouter(<Wishlist />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'My wishlist' })).toBeInTheDocument();
      expect(screen.getByText('Your wishlist is empty.')).toBeInTheDocument();
    });
  });

  it('renderiza items cuando el store tiene datos', async () => {
    const { add } = useWishlist.getState();
    add({
      id: 101,
      title: 'Inception',
      tagline: 'Your mind is the scene of the crime.',
      posterPath: '/inception.jpg',
    } as Movie);
    add({
      id: 202,
      title: 'Interstellar',
      tagline: 'Mankind was born on Earth. It was never meant to die here.',
      posterPath: '/interstellar.jpg',
    } as Movie);

    renderWithRouter(<Wishlist />);

    await waitFor(() => {
      expect(screen.queryByText('Your wishlist is empty.')).not.toBeInTheDocument();

      const links = screen.getAllByRole('link');
      const hrefs = links.map((a) => (a as HTMLAnchorElement).getAttribute('href'));
      expect(hrefs).toEqual(['/movie/101', '/movie/202']);
    });
  });
});
