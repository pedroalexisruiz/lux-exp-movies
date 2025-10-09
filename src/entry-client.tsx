import './index.css';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

const initialState = window.__INITIAL_STATE__ || undefined;

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <App initialState={initialState} />
  </StrictMode>,
);
