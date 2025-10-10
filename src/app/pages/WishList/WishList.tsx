import { Link } from 'react-router';
import './WishList.scss';
import { useWishlist } from '../../store/whishListStore';
import { MovieCard } from '../../features/movies/components/MovieCard';
import { getImagePath } from '../../utils/imagePath';
import { Carousel } from '../../shared/ui/Carousel';
import { useMemo } from 'react';
import { useScrollToTop } from '../../shared/hooks/useScrollToTop';

export function Wishlist() {
  const itemsObj = useWishlist((s) => s.items);
  const items = useMemo(() => Object.values(itemsObj), [itemsObj]);
  useScrollToTop();
  return (
    <section className="wishlist">
      <h1 className="wishlist__title">My wishlist</h1>
      {items.length === 0 && <p className="wishlist__empty">Your wishlist is empty.</p>}
      {items.length > 0 && (
        <Carousel gap={18} peek={24} loop arrows height="auto">
          {items.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              state={{ movie }}
              style={{ textDecoration: 'none' }}
            >
              <MovieCard
                title={movie.title}
                subtitle={movie.tagline}
                image={getImagePath(movie.posterPath, 'w342')}
              />
            </Link>
          ))}
        </Carousel>
      )}
    </section>
  );
}
