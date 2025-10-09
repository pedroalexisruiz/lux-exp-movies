import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { TmdbMovieRepository } from './api/infrastructure/repository';
import { makeListGenres } from './api/application';
import { InitialState } from './app/domain/InitialState';
import { StaticRouter } from 'react-router';
import { makeGetMovieDetails } from './api/application/GetMovieDetails';

export async function render(url: string) {
  const repo = new TmdbMovieRepository();
  const listGenres = makeListGenres(repo);
  const getMovie = makeGetMovieDetails(repo);

  const initialState: InitialState = {};
  if (url === '/' || url.startsWith('/home')) {
    initialState.genres = await listGenres();
  }
  const movieMatch = url.match(/^\/movie\/(\d+)/);
  if (movieMatch) {
    const id = movieMatch[1];
    initialState.movie = await getMovie(id);
  }
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App initialState={initialState} />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, initialState };
}
