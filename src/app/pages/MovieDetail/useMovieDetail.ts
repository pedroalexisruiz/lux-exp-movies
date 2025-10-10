import { useLoaderData } from 'react-router';
import { Movie } from '../../../api/domain/model';

export const useMovieDetail = () => {
  const data = useLoaderData<{ movie: Movie; similarMovies: Movie[] }>();
  const { movie, similarMovies } = data;

  if (!movie) return { movie: null, similarMovies: [] };

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '—';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '—';
  const rating = movie.voteAverage != null ? movie.voteAverage.toFixed(1) : '—';
  const votes = movie.voteCount ? `(${(movie.voteCount / 1_000_000).toFixed(1)}M)` : '';

  const languagesList = movie.spokenLanguages.map((l) => l.englishName);
  const countriesList = movie.productionCountries.map((c) => c.name);
  return { movie, similarMovies, year, runtime, rating, votes, languagesList, countriesList };
};
