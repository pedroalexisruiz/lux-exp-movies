import './App.scss';
import { InitialState } from './app/domain/InitialState';
import { Route, Routes } from 'react-router';
import { MovieDetail } from './app/pages/MovieDetail';
import Home from './app/pages/Home/Home';

interface AppProps {
  initialState?: InitialState;
}

function App({ initialState }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<Home initialState={initialState} />} />
      <Route path="/home" element={<Home initialState={initialState} />} />
      <Route
        path="/movie/:id"
        element={<MovieDetail initialMovie={initialState?.movie ?? null} />}
      />
      <Route path="*" element={<p>404</p>} />
    </Routes>
  );
}

export default App;
