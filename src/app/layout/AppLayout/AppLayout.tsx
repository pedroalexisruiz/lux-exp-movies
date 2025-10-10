import { Outlet } from 'react-router';
import './AppLayout.scss';
import { Header } from '../header/Header';

export const AppLayout = () => (
  <div className="app-layout">
    <Header />

    <main className="app-main">
      <div className="container">
        <Outlet />
      </div>
    </main>
  </div>
);
