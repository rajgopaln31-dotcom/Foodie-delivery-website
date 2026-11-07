import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LOCATIONS } from '../data/mockData';
import { logout } from '../store/authSlice';
import { selectCartCount } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLocation } from '../store/restaurantSlice';
import { useToast } from './Toast';

export function Logo() {
  return (
    <span className="logo" aria-label="RG.FOODHouse">
      <span className="logo-mark">🍔</span> RG.FOOD<span>House</span>
    </span>
  );
}

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const user = useAppSelector((s) => s.auth.user);
  const location = useAppSelector((s) => s.restaurants.location);
  const count = useAppSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    notify('You have been logged out', 'info');
    navigate('/login', { replace: true });
  };

  const close = () => { setMenuOpen(false); setProfileOpen(false); };

  return (
    <header className="header">
      <div className="container header-inner">
        <button className="icon-btn menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <Link to="/" onClick={close}><Logo /></Link>

        <label className="location">
          <span aria-hidden="true">📍</span>
          <select aria-label="Delivery location" value={location} onChange={(e) => dispatch(setLocation(e.target.value))}>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>

        <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/restaurants" onClick={close}>Restaurants</NavLink>
          <NavLink to="/orders" onClick={close}>My Orders</NavLink>
        </nav>

        <div className="header-actions">
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} items`} onClick={close}>
            🛒{count > 0 && <span className="badge">{count}</span>}
          </Link>
          <div className="profile" ref={profileRef}>
            <button className="icon-btn" aria-label="Profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((o) => !o)}>👤</button>
            {profileOpen && (
              <div className="dropdown" role="menu">
                <div className="dropdown-head">
                  <strong>{user?.name}</strong>
                  <span className="muted small">{user?.email}</span>
                </div>
                <Link to="/orders" role="menuitem" onClick={close}>My Orders</Link>
                <Link to="/cart" role="menuitem" onClick={close}>My Cart</Link>
                <button role="menuitem" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
