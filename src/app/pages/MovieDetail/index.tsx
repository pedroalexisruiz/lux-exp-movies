import './MovieDetail.scss';

import placeholderPoster from '../../../assets/cinema-placeholder.jpg';
import { Hero } from '../../features/movies/components/Hero/Hero';
import { Meta } from '../../features/movies/components/Meta/Meta';
import { ChipList } from '../../features/movies/components/ChipList/ChipList';
import { CollectionCard } from '../../features/movies/components/CollectionCard/CollectionCard';
import { Actions } from '../../features/movies/components/Actions/Actions';
import { RecommendationSection } from '../../features/movies/components/RecommendationSection/RecommendationSection';
import { DetailSection } from '../../features/movies/components/DetailSection/DetailSection';
import { CompanyInfo } from '../../features/movies/components/CompanyInfo/CompanyInfo';
import { getImagePath } from '../../utils/imagePath';
import { useMovieDetail } from './useMovieDetail';

export function MovieDetail() {
  const { movie, similarMovies, year, runtime, rating, votes, languagesList, countriesList } =
    useMovieDetail();
  if (!movie) return <p>Movie not found.</p>;
  return (
    <section className="movie-detail">
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
          <p className="movie-detail__synopsis">{movie.overview || 'Sin sinopsis disponible.'}</p>

          <Actions
            primaryLabel={movie.homepage ? 'Visit homepage' : undefined}
            onPrimary={() => window.open(movie.homepage!, '_blank')}
          />

          {!!movie.belongsToCollection && (
            <section className="md-collection">
              <h2 className="movie-detail__section-title">Collection</h2>
              <CollectionCard
                title={movie.belongsToCollection.name}
                image={
                  getImagePath(movie.belongsToCollection.posterPath, 'w342') || placeholderPoster
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

      {!!similarMovies.length && (
        <RecommendationSection title="You might also like" movies={similarMovies} />
      )}
    </section>
  );
}
