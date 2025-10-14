import './MovieCard.scss';
import placeholderPoster from '@assets/movie-placeholder.jpeg';
import { FaStar } from 'react-icons/fa';

export interface MovieCardProps {
  title: string;
  subtitle?: string;
  rating?: string;
  image: string | null | undefined;
  onClick?: () => void;
}

export const MovieCard = ({ title, subtitle, image, rating, onClick }: MovieCardProps) => {
  return (
    <div className="movie-card" onClick={onClick} role="button">
      <div className="movie-card__poster-wrap">
        <img
          data-testid={`movie-card-image-${title}`}
          className="movie-card__poster"
          src={image ?? placeholderPoster}
          alt={title}
          loading="lazy"
        />
      </div>
      <p className="movie-card__title" title={title}>
        {title}
      </p>
      <div className="movie-card__summary">
        {subtitle && <p className="movie-card__subtitle">{subtitle}</p>}
        {rating && (
          <div className="movie-card__rating">
            <FaStar />
            <span>{rating}</span>
          </div>
        )}
      </div>
    </div>
  );
};
