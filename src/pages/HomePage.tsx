import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Img from '../components/Img';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeletons, ErrorState } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { CATEGORIES } from '../data/mockData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCatalog } from '../store/restaurantSlice';
import { formatINR } from '../utils/pricing';

const BANNERS = [
  { title: '50% OFF your first order', text: 'Up to ₹100 off on orders above ₹200', code: 'WELCOME50', cls: 'b1' },
  { title: 'Flat ₹20 OFF', text: 'On orders above ₹150, every day', code: 'SAVE20', cls: 'b2' },
  { title: 'Free delivery', text: 'On orders above ₹300 from top restaurants', code: 'FREEDEL', cls: 'b3' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const { restaurants, foods, status, error, location } = useAppSelector((s) => s.restaurants);
  const [q, setQ] = useState('');

  const loading = status === 'idle' || status === 'loading';
  const popular = [...restaurants].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
  const topRated = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const recommended = foods.filter((f) => f.available).filter((_, i) => i % 6 === 0).slice(0, 8);
  const nameOf = (id: string) => restaurants.find((r) => r.id === id)?.name ?? '';

  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/restaurants?q=${encodeURIComponent(q.trim())}` : '/restaurants');
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      notify(`Coupon ${code} copied. Apply it in your cart.`, 'success');
    } catch {
      notify(`Use coupon code ${code} in your cart.`, 'info');
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="hero-loc">📍 Delivering to <strong>{location}</strong></p>
          <h1>Hungry? We deliver happiness.</h1>
          <form className="search-bar" onSubmit={search} role="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for restaurants or dishes (e.g. biryani, pizza)" aria-label="Search restaurants or food" />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <h2>What's on your mind?</h2>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c.name} to={`/restaurants?cat=${encodeURIComponent(c.name)}`} className="cat-item">
                <span className="cat-emoji">{c.emoji}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Offers for you</h2>
          <div className="banners">
            {BANNERS.map((b) => (
              <div key={b.code} className={`banner ${b.cls}`}>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                <button className="btn btn-light btn-sm" onClick={() => copy(b.code)}>Use code {b.code}</button>
              </div>
            ))}
          </div>
        </section>

        {error && status === 'failed' ? (
          <ErrorState message={error} onRetry={() => void dispatch(fetchCatalog())} />
        ) : (
          <>
            <section className="section">
              <div className="section-head"><h2>Popular restaurants</h2><Link to="/restaurants">See all →</Link></div>
              {loading ? <CardSkeletons /> : <div className="grid">{popular.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}</div>}
            </section>

            <section className="section">
              <h2>Recommended for you</h2>
              {loading ? <CardSkeletons count={4} /> : (
                <div className="grid">
                  {recommended.map((f) => (
                    <Link key={f.id} to={`/restaurants/${f.restaurantId}?food=${f.id}`} className="card card-link">
                      <div className="card-img short"><Img src={f.image} alt={f.name} emoji={f.emoji} /></div>
                      <div className="card-body">
                        <h3><span className={f.veg ? 'veg-dot' : 'nonveg-dot'} /> {f.name}</h3>
                        <p className="muted small">{nameOf(f.restaurantId)}</p>
                        <strong>{formatINR(f.price)}</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-head"><h2>Top-rated restaurants</h2><Link to="/restaurants">See all →</Link></div>
              {loading ? <CardSkeletons /> : <div className="grid">{topRated.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}</div>}
            </section>
          </>
        )}
      </div>
    </>
  );
}
