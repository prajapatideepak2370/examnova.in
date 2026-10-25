import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="app-shell">
      <Header />
      <main className="page-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
