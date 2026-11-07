import { Link } from 'react-router-dom';
import type { Restaurant } from '../types';
import { formatINR } from '../utils/pricing';
import FavouriteButton from './FavouriteButton';
import Img from './Img';

export default function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <Link to={`/restaurants/${r.id}`} className="card card-link">
      <div className="card-img">
        <Img src={r.image} alt={r.name} emoji={r.emoji} />
        {r.offer && <span className="tag-offer">{r.offer}</span>}
        <FavouriteButton restaurantId={r.id} name={r.name} />
      </div>
      <div className="card-body">
        <div className="row between">
          <h3>{r.name}</h3>
          <span className="rating">★ {r.rating.toFixed(1)}</span>
        </div>
        <p className="muted small">{r.cuisines.join(' • ')}</p>
        <p className="meta">
          <span>🕒 {r.deliveryTime} min</span>
          <span>{formatINR(r.priceForTwo)} for two</span>
        </p>
      </div>
    </Link>
  );
}
