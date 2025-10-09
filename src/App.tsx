import './App.scss';
import { Route, Routes } from 'react-router';
import { MovieDetail } from './app/pages/MovieDetail';
import Home from './app/pages/Home/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="*" element={<p>404</p>} />
    </Routes>
  );
}

export default App;
