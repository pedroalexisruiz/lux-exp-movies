import './MovieCard.scss';
import placeholderPoster from '../../../../../assets/movie-placeholder.jpeg';

export interface MovieCardProps {
  title: string;
  subtitle?: string;
  image: string | null | undefined;
  onClick?: () => void;
}

export const MovieCard = ({ title, subtitle, image, onClick }: MovieCardProps) => {
  return (
    <div className="movie-card" onClick={onClick} role="button">
      <div className="movie-card__poster-wrap">
        <img
          className="movie-card__poster"
          src={image ?? placeholderPoster}
          alt={title}
          loading="lazy"
        />
      </div>
      <p className="movie-card__title" title={title}>
        {title}
      </p>
      {subtitle && <p className="movie-card__subtitle">{subtitle}</p>}
    </div>
  );
};
