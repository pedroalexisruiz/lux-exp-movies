import './App.css';
import { InitialState } from './app/domain/InitialState';

interface AppProps {
  initialState?: InitialState;
}

function App({ initialState }: AppProps) {
  // this is temporary, just for debugging purposes
  console.log('initialState', initialState);
  return (
    <>
      <h1>Movies</h1>
    </>
  );
}

export default App;
