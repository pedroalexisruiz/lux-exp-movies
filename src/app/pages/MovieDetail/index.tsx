import { useLoaderData, useLocation } from 'react-router';
import './MovieDetail.scss';
import { Movie } from '../../../api/domain/model';

export function MovieDetail() {
  const location = useLocation();
  const passedMovie = (location.state as { movie?: Movie } | undefined)?.movie;
  const initialMovie = useLoaderData<Movie>();
  const movie = passedMovie ?? initialMovie;

  if (!movie) return <p>Movie not found.</p>;

  return (
    <article className="movie-detail">
      <header className="movie-detail__header">
        <img
          className="movie-detail__poster"
          src={
            movie.posterPath
              ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
              : '/images/placeholder-poster.jpg'
          }
          alt={movie.title}
          loading="lazy"
        />
        <div className="movie-detail__info">
          <h1 className="movie-detail__title">{movie.title}</h1>
          {/* {movie.releaseDate && <p>Estreno: {movie.releaseDate}</p>} */}
          {movie.voteAverage != null && <p>Rating: {movie.voteAverage}/10</p>}
        </div>
      </header>
      {movie.overview && <p className="movie-detail__overview">{movie.overview}</p>}
    </article>
  );
}
