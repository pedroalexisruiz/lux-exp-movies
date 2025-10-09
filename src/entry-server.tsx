import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { TmdbMovieRepository } from './api/infrastructure/repository';
import { makeListGenres } from './api/application';
import { InitialState } from './app/domain/InitialState';

export async function render(url: string) {
  const repo = new TmdbMovieRepository();
  const listGenres = makeListGenres(repo);

  const initialState: InitialState = {};
  if (url === '/' || url.startsWith('/home')) {
    initialState.genres = await listGenres();
  }
  const html = renderToString(
    <StrictMode>
      <App initialState={initialState} />
    </StrictMode>,
  );
  return { html, initialState };
}
