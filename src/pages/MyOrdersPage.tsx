import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Img from '../components/Img';
import { ErrorState } from '../components/Skeleton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/orderSlice';
import { formatINR } from '../utils/pricing';
import { ORDER_STATUSES, statusIndex } from '../utils/orderStatus';

export default function MyOrdersPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { items, status, error } = useAppSelector((s) => s.orders);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (user) void dispatch(fetchOrders(user.id));
  }, [user, dispatch]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="container page narrow">
      <h1 className="page-title">My orders</h1>
      {status === 'failed' && error ? (
        <ErrorState message={error} onRetry={() => user && void dispatch(fetchOrders(user.id))} />
      ) : status === 'loading' && items.length === 0 ? (
        <div className="skeleton" style={{ height: 120 }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">📦</div>
          <h3>No orders yet</h3>
          <p className="muted">Your placed orders will appear here.</p>
          <Link to="/restaurants" className="btn btn-primary">Order now</Link>
        </div>
      ) : (
        <ul className="order-list">
          {items.map((o) => {
            const idx = statusIndex(o, now);
            return (
              <li key={o.id} className="panel order-row">
                <Img src={o.restaurantImage} alt={o.restaurantName} />
                <div className="grow">
                  <h3>{o.restaurantName}</h3>
                  <p className="small muted">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                  <p className="small muted">#{o.id} • {new Date(o.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="order-side">
                  <strong>{formatINR(o.total)}</strong>
                  <span className={`status-pill ${idx === ORDER_STATUSES.length - 1 ? 'ok' : ''}`}>{ORDER_STATUSES[idx]}</span>
                  <Link to={`/order/${o.id}`} className="btn btn-outline btn-sm">{idx === ORDER_STATUSES.length - 1 ? 'View' : 'Track'}</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
