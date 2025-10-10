import { Outlet } from 'react-router';
import { Header } from '../header/Header';
import './AppLayout.scss';

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
