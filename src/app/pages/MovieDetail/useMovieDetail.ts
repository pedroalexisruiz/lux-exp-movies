import { useLoaderData } from 'react-router';
import { Movie } from '@domain/model';
import { useWishlist } from '@store/whishListStore';
import { useEffect, useState } from 'react';
import { parseAverage, parseYearString } from '@/utils/stringParser';
import { Paginated } from '@/api/domain/model/Pagination';

export const useMovieDetail = () => {
  const data = useLoaderData<{ movie: Movie | null; similarMovies: Paginated<Movie> }>();
  const { movie, similarMovies } = data;

  const [hydrated, setHydrated] = useState(false);

  const add = useWishlist((state) => state.add);
  const remove = useWishlist((state) => state.remove);
  const wishNow = useWishlist((s) => (movie ? s.has(movie.id) : false));
  const isInWishlist = hydrated ? wishNow : false;

  useEffect(() => setHydrated(true), []);

  if (!movie) return { movie, similarMovies };

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
