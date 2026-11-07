import { Link } from 'react-router-dom';
import { Logo } from './Header';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo />
          <p className="muted small">Hot food from your favourite restaurants, delivered fast.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <p className="muted small">© {new Date().getFullYear()} FoodieGo. Demo project.</p>
      </div>
    </footer>
  );
}
