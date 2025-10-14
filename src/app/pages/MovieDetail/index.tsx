import placeholderPoster from '@assets/cinema-placeholder.jpg';
import { Actions } from '@features/movies/components/Actions/Actions';
import { ChipList } from '@features/movies/components/ChipList/ChipList';
import { CollectionCard } from '@features/movies/components/CollectionCard/CollectionCard';
import { CompanyInfo } from '@features/movies/components/CompanyInfo/CompanyInfo';
import { DetailSection } from '@features/movies/components/DetailSection/DetailSection';
import { Hero } from '@features/movies/components/Hero/Hero';
import { Meta } from '@features/movies/components/Meta/Meta';
import { RecommendationSection } from '@features/movies/components/RecommendationSection/RecommendationSection';
import { useScrollToTop } from '@shared/hooks/useScrollToTop';
import { useScopedTheme } from '@shared/theme/useScopedTheme';
import { getImagePath } from '@utils/imagePath';
import { useRef } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useMovieDetail } from './useMovieDetail';

import './MovieDetail.scss';

export function MovieDetail() {
  const {
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
  } = useMovieDetail();
  const rootRef = useRef<HTMLElement>(null);
  const firstGenreId = movie?.genres?.[0]?.id ?? 0;
  useScopedTheme(rootRef, firstGenreId);
  useScrollToTop([movie?.id]);

  return (
    <section ref={rootRef} className="movie-detail">
      {!movie && (
        <section className="movie-detail__not-found-section">
          <h1 className="md-hero__title">Movie not found.</h1>
          <p className="hero__tagline">Sorry, the movie you're trying to watch is not available.</p>
        </section>
      )}
      {movie && (
        <>
          <Hero
            backdrop={
              getImagePath(movie.backdropPath, 'w1280') || getImagePath(movie.posterPath, 'w780')
            }
            poster={getImagePath(movie.posterPath, 'w500') || placeholderPoster}
          >
            <h1 className="md-hero__title">{movie.title}</h1>
            {movie.tagline && <p className="md-hero__tagline">{movie.tagline}</p>}

            <Meta
              year={String(year)}
              status={movie.status || ''}
              runtime={runtime}
              rating={rating}
              votes={votes}
            />

            {!!movie.genres?.length && <ChipList items={movie.genres.map((g) => g.name)} />}
          </Hero>
          <div className="movie-detail__body">
            <div className="movie-detail__col-left">
              <h2 className="movie-detail__section-title">Summary</h2>
              <p className="movie-detail__synopsis">{movie.overview || 'No synopsis available.'}</p>

              <Actions
                primaryLabel={movie.homepage ? 'Visit homepage' : undefined}
                onPrimary={() => window.open(movie.homepage!, '_blank')}
                secondaryLabel="Add to wishlist"
                onSecondary={toggleItemOnWishlist}
                secondaryIcon={isInWishlist ? <FaHeart /> : <FaRegHeart />}
                secondaryActive={isInWishlist}
              />

              {!!movie.belongsToCollection && (
                <section className="md-collection">
                  <h2 className="movie-detail__section-title">Collection</h2>
                  <CollectionCard
                    title={movie.belongsToCollection.name}
                    image={
                      getImagePath(movie.belongsToCollection.posterPath, 'w342') ||
                      placeholderPoster
                    }
                  />
                </section>
              )}
            </div>

            <aside className="movie-detail__col-right">
              <DetailSection title="Production Companies">
                <ul className="md-company-info">
                  {movie.productionCompanies.slice(0, 6).map((company) => (
                    <CompanyInfo
                      key={company.id}
                      avatar={getImagePath(company.logoPath, 'w342') || placeholderPoster}
                      name={company.name}
                      role={company.originCountry}
                    />
                  ))}
                </ul>
              </DetailSection>

              <DetailSection title="Spoken Languages">
                <ChipList key="language-list" items={languagesList} />
              </DetailSection>
              <DetailSection title="Production Countries">
                <ChipList key="countries-list" items={countriesList} />
              </DetailSection>
            </aside>
          </div>
        </>
      )}

      {!!similarMovies.items.length && (
        <RecommendationSection title="You might also like" movies={similarMovies.items} />
      )}
    </section>
  );
}
