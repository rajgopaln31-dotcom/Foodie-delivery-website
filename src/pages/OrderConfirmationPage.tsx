import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { lineDetails, PriceSummary } from '../components/OrderSummary';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/orderSlice';
import { formatINR } from '../utils/pricing';
import { ORDER_STATUSES, STEP_MS, statusIndex } from '../utils/orderStatus';

export default function OrderConfirmationPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const order = useAppSelector((s) => s.orders.items.find((o) => o.id === id));
  const status = useAppSelector((s) => s.orders.status);
  const [now, setNow] = useState(() => Date.now());
  const timelineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!order && user && status === 'idle') void dispatch(fetchOrders(user.id));
  }, [order, user, status, dispatch]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!order) {
    if (status === 'idle' || status === 'loading') return <div className="container page"><div className="skeleton" style={{ height: 320 }} /></div>;
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-emoji">🧾</div>
          <h3>Order not found</h3>
          <Link className="btn btn-primary" to="/orders">View my orders</Link>
        </div>
      </div>
    );
  }

  const current = statusIndex(order, now);
  const delivered = current === ORDER_STATUSES.length - 1;
  const elapsedMin = Math.floor((now - order.createdAt) / 60000);
  const remaining = Math.max(0, order.etaMinutes - elapsedMin);
  const nextIn = Math.max(0, Math.ceil((order.createdAt + (current + 1) * STEP_MS - now) / 1000));

  return (
    <div className="container page narrow">
      <div className="success-box">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h1>Order placed successfully!</h1>
        <p className="muted">Thank you for ordering with FoodieGo.</p>
        <p className="order-id">Order ID: <strong>{order.id}</strong></p>
        <p>{delivered ? 'Your order has been delivered. Enjoy your meal! 🎉' : <>Estimated delivery in <strong>{remaining} min</strong></>}</p>
        <div className="row center">
          <button className="btn btn-primary" onClick={() => timelineRef.current?.scrollIntoView({ behavior: 'smooth' })}>Track Order</button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Continue Shopping</button>
          <button className="btn btn-outline" onClick={() => navigate('/orders')}>View My Orders</button>
        </div>
      </div>

      <section className="panel" ref={timelineRef}>
        <h3>Order status</h3>
        <ol className="timeline">
          {ORDER_STATUSES.map((label, i) => (
            <li key={label} className={i < current ? 'done' : i === current ? 'current' : ''}>
              <span className="dot">{i <= current ? '✓' : i + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <p className="muted small">
          Demo tracking: statuses are simulated and advance every {STEP_MS / 1000} seconds{!delivered && ` (next update in ${nextIn}s)`}.
        </p>
      </section>

      <div className="two-col even">
        <section className="panel">
          <h3>{order.restaurantName}</h3>
          <ul className="summary-items">
            {order.items.map((i) => (
              <li key={i.key}>
                <span className={i.veg ? 'veg-dot' : 'nonveg-dot'} />
                <span className="grow">{i.quantity} × {i.name}{lineDetails(i) && <small className="muted"> ({lineDetails(i)})</small>}</span>
                <span>{formatINR(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <PriceSummary totals={order} />
          <p className="small muted">Payment: {({ upi: 'UPI', card: 'Card', netbanking: 'Net Banking', cod: 'Cash on Delivery' })[order.paymentMethod]}</p>
        </section>
        <section className="panel">
          <h3>Delivery address</h3>
          <p><strong>{order.address.fullName}</strong></p>
          <p className="small">{order.address.house}, {order.address.street}{order.address.landmark ? `, ${order.address.landmark}` : ''}</p>
          <p className="small">{order.address.city}, {order.address.state} – {order.address.pin}</p>
          <p className="small muted">📞 {order.address.mobile}</p>
          {order.address.instructions && <p className="small muted">Note: {order.address.instructions}</p>}
          <p className="small muted">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </section>
      </div>
    </div>
  );
}
