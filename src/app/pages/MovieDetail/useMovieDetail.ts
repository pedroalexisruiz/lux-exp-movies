import { useLoaderData } from 'react-router';
import { Movie } from '../../../api/domain/model';
import { useWishlist } from '../../store/whishListStore';
import { useEffect, useState } from 'react';
import { parseAverage, parseYearString } from '../../../utils/stringParser';

export const useMovieDetail = () => {
  const data = useLoaderData<{ movie: Movie; similarMovies: Movie[] }>();
  const { movie, similarMovies } = data;

  const [hydrated, setHydrated] = useState(false);

  const add = useWishlist((state) => state.add);
  const remove = useWishlist((state) => state.remove);
  const wishNow = useWishlist((s) => (movie ? s.has(movie.id) : false));
  const isInWishlist = hydrated ? wishNow : false;

  if (!movie) return { movie: null, similarMovies: [] };

  const toggleItemOnWishlist = () => {
    if (isInWishlist) {
      remove(movie.id);
    } else {
      add(movie);
    }
  };

  const year = movie.releaseDate ? parseYearString(movie.releaseDate) : '—';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '—';
  const rating = movie.voteAverage != null ? parseAverage(movie.voteAverage) : '—';
  const votes = movie.voteCount ? `(${(movie.voteCount / 1_000_000).toFixed(1)}M)` : '';

  const languagesList = movie.spokenLanguages.map((l) => l.englishName);
  const countriesList = movie.productionCountries.map((c) => c.name);

  useEffect(() => setHydrated(true), []);

  return {
    movie,
    similarMovies,
    year,
    runtime,
    rating,
    votes,
    languagesList,
    countriesList,
    isInWishlist,
    toggleItemOnWishlist,
  };
};
