import { NavLink } from 'react-router';
import { MdMovie } from 'react-icons/md';
import { MdFavorite } from 'react-icons/md';
import { MdLocalMovies } from 'react-icons/md';
import './Header.scss';

export const Header = () => (
  <header className="header">
    <div className="header__inner">
      <NavLink to="/" className="header__logo">
        <MdLocalMovies />
        CineApp
      </NavLink>
      <nav className="header__nav">
        <NavLink to="/home">
          <MdMovie />
          Home
        </NavLink>
        <NavLink to="/wishlist">
          {' '}
          <MdFavorite />
          Wishlist
        </NavLink>
      </nav>
    </div>
  </header>
);
