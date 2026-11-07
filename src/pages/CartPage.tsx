import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Img from '../components/Img';
import { lineDetails, PriceSummary } from '../components/OrderSummary';
import QtyStepper from '../components/QtyStepper';
import { useToast } from '../components/Toast';
import { applyCoupon, clearCart, removeCoupon, removeItem, selectCartTotals, setQuantity } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { COUPONS, formatINR, validateCoupon } from '../utils/pricing';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const items = useAppSelector((s) => s.cart.items);
  const couponCode = useAppSelector((s) => s.cart.couponCode);
  const restaurantId = useAppSelector((s) => s.cart.restaurantId);
  const restaurant = useAppSelector((s) => s.restaurants.restaurants.find((r) => r.id === restaurantId));
  const totals = useAppSelector(selectCartTotals);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-emoji">🛒</div>
          <h3>Your cart is empty</h3>
          <p className="muted">Add something delicious from a restaurant to get started.</p>
          <Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>
        </div>
      </div>
    );
  }

  const couponWarning = couponCode ? validateCoupon(couponCode, totals.subtotal) : null;

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) { setCodeError('Enter a coupon code'); return; }
    const err = validateCoupon(value, totals.subtotal);
    if (err) { setCodeError(err); return; }
    dispatch(applyCoupon(value));
    setCode('');
    setCodeError('');
    notify(`Coupon ${value} applied`, 'success');
  };

  const checkout = () => {
    if (items.length === 0) { notify('Your cart is empty', 'error'); return; }
    navigate('/checkout');
  };

  return (
    <div className="container page">
      <div className="row between">
        <h1 className="page-title">Your cart</h1>
        <button className="link-btn danger" onClick={() => setConfirmClear(true)}>Clear cart</button>
      </div>
      <div className="two-col">
        <section className="panel">
          {restaurant && <p className="muted">Ordering from <Link to={`/restaurants/${restaurant.id}`}><strong>{restaurant.name}</strong></Link></p>}
          <ul className="cart-list">
            {items.map((i) => (
              <li key={i.key} className="cart-item">
                <Img src={i.image} alt={i.name} emoji={i.emoji} />
                <div className="grow">
                  <h3><span className={i.veg ? 'veg-dot' : 'nonveg-dot'} /> {i.name}</h3>
                  {lineDetails(i) && <p className="muted small">{lineDetails(i)}</p>}
                  <p className="small">{formatINR(i.unitPrice)} each</p>
                </div>
                <div className="cart-actions">
                  <QtyStepper value={i.quantity} onChange={(v) => dispatch(setQuantity({ key: i.key, quantity: v }))} />
                  <strong>{formatINR(i.unitPrice * i.quantity)}</strong>
                  <button className="link-btn danger" onClick={() => { dispatch(removeItem(i.key)); notify(`${i.name} removed`, 'info'); }}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="panel summary-panel">
          <h3>Apply coupon</h3>
          {couponCode ? (
            <div className="coupon-applied">
              <span>🏷️ <strong>{couponCode}</strong> applied</span>
              <button className="link-btn danger" onClick={() => { dispatch(removeCoupon()); notify('Coupon removed', 'info'); }}>Remove</button>
            </div>
          ) : (
            <form onSubmit={apply} noValidate>
              <div className="coupon-row">
                <input value={code} onChange={(e) => { setCode(e.target.value); setCodeError(''); }} placeholder="Enter coupon code" aria-label="Coupon code" className={codeError ? 'invalid' : ''} />
                <button className="btn btn-outline" type="submit">Apply</button>
              </div>
              {codeError && <p className="error-text" role="alert">{codeError}</p>}
            </form>
          )}
          {couponWarning && <p className="error-text">Coupon {couponCode} is not active: {couponWarning}</p>}
          <ul className="coupon-list">
            {Object.entries(COUPONS).map(([c, r]) => (
              <li key={c}><strong>{c}</strong> <span className="muted small">{r.description}</span></li>
            ))}
          </ul>

          <h3>Price details</h3>
          <PriceSummary totals={totals} />
          <button className="btn btn-primary btn-block" onClick={checkout}>Proceed to Checkout</button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        danger
        title="Clear cart?"
        message="All items will be removed from your cart."
        confirmLabel="Clear cart"
        onConfirm={() => { dispatch(clearCart()); setConfirmClear(false); notify('Cart cleared', 'info'); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
