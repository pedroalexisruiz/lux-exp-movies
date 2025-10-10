import { Genre } from './Genre';
import { ProductionCompany } from './ProductionCompany';
import { ProductionCountry } from './ProductionCountry';
import { SpokenLanguage } from './SpokenLanguage';

export interface Movie {
  adult: boolean;
  backdropPath: string;
  belongsToCollection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdbID: string;
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  popularity: number;
  posterPath: string;
  productionCompanies: ProductionCompany[];
  productionCountries: ProductionCountry[];
  releaseDate: Date;
  revenue: number;
  runtime: number;
  spokenLanguages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
}

export interface Collection {
  id: number;
  name: string;
  posterPath: string;
  backdropPath: string;
}
