import './index.scss';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router';

const initialState = window.__INITIAL_STATE__ || undefined;

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <BrowserRouter>
      <App initialState={initialState} />
    </BrowserRouter>
  </StrictMode>,
);

delete window.__INITIAL_STATE__;
