import { InitialState } from '../src/app/domain/InitialState';

declare global {
  interface Window {
    __INITIAL_STATE__?: InitialState;
  }
}
export {};
