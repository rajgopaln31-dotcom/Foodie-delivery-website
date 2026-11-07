import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCatalog } from '../store/restaurantSlice';
import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.restaurants.status);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchCatalog());
  }, [status, dispatch]);

  return (
    <>
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
