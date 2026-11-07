import { useRef, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary';
import TextField from '../components/TextField';
import { useToast } from '../components/Toast';
import { selectSelectedAddress } from '../store/addressSlice';
import { clearCart, selectCartTotals } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearPlaceError, placeOrder } from '../store/orderSlice';
import type { PaymentMethod } from '../types';
import { formatINR } from '../utils/pricing';
import { cardExpiryError, isUpi } from '../utils/validators';

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'];
const COD_LIMIT = 2000;

interface Details { upiId: string; cardNumber: string; cardName: string; expiry: string; cvv: string; bank: string }
type Errors = Partial<Record<keyof Details, string>>;

function validate(method: PaymentMethod, d: Details): Errors {
  const e: Errors = {};
  if (method === 'upi') {
    if (!d.upiId.trim()) e.upiId = 'UPI ID is required';
    else if (!isUpi(d.upiId)) e.upiId = 'Enter a valid UPI ID (e.g. name@bank)';
  }
  if (method === 'card') {
    if (d.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Enter a valid 16-digit card number';
    if (d.cardName.trim().length < 2) e.cardName = 'Name on card is required';
    const exp = cardExpiryError(d.expiry);
    if (exp) e.expiry = exp;
    if (!/^\d{3}$/.test(d.cvv)) e.cvv = 'Enter the 3-digit CVV';
  }
  if (method === 'netbanking' && !d.bank) e.bank = 'Please select your bank';
  return e;
}

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const items = useAppSelector((s) => s.cart.items);
  const restaurantId = useAppSelector((s) => s.cart.restaurantId);
  const restaurant = useAppSelector((s) => s.restaurants.restaurants.find((r) => r.id === restaurantId));
  const totals = useAppSelector(selectCartTotals);
  const address = useAppSelector(selectSelectedAddress);
  const user = useAppSelector((s) => s.auth.user);
  const processing = useAppSelector((s) => s.orders.placing === 'loading');
  const payError = useAppSelector((s) => s.orders.placeError);

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [d, setD] = useState<Details>({ upiId: '', cardNumber: '', cardName: '', expiry: '', cvv: '', bank: '' });
  const [errors, setErrors] = useState<Errors>({});
  const submitting = useRef(false);
  const done = useRef(false);

  if (!done.current && items.length === 0) return <Navigate to="/cart" replace />;
  if (!done.current && !address) return <Navigate to="/checkout" replace />;
  if (!restaurant || !address || !user) return <div className="container page"><div className="skeleton" style={{ height: 320 }} /></div>;

  const codAllowed = totals.total <= COD_LIMIT;
  const set = <K extends keyof Details>(k: K, v: string) => {
    setD((cur) => ({ ...cur, [k]: v }));
    setErrors((cur) => ({ ...cur, [k]: undefined }));
    if (payError) dispatch(clearPlaceError());
  };
  const choose = (m: PaymentMethod) => { setMethod(m); setErrors({}); dispatch(clearPlaceError()); };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current || processing) return; // prevent duplicate submissions
    const found = validate(method, d);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    submitting.current = true;
    try {
      const order = await dispatch(
        placeOrder({
          order: {
            userId: user.id,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            restaurantImage: restaurant.image,
            items,
            address,
            subtotal: totals.subtotal,
            discount: totals.discount,
            delivery: totals.delivery,
            tax: totals.tax,
            total: totals.total,
            paymentMethod: method,
            etaMinutes: restaurant.deliveryTime + 10,
          },
          payment: { method, ...d },
        }),
      ).unwrap(); // success is shown only after the order is confirmed
      done.current = true;
      notify(method === 'cod' ? 'Order placed. Pay on delivery.' : 'Payment successful. Order placed!', 'success');
      navigate(`/order/${order.id}`, { replace: true });
      dispatch(clearCart());
    } catch (err) {
      notify(typeof err === 'string' ? err : 'Payment failed. Please try again.', 'error');
    } finally {
      submitting.current = false;
    }
  };

  const cancel = () => {
    if (processing) return;
    dispatch(clearPlaceError());
    notify('Payment cancelled. Your cart is safe.', 'warning');
    navigate('/checkout');
  };

  const methods: { id: PaymentMethod; label: string; icon: string; disabled?: boolean; hint?: string }[] = [
    { id: 'upi', label: 'UPI', icon: '📱' },
    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
    { id: 'cod', label: 'Cash on Delivery', icon: '💵', disabled: !codAllowed, hint: codAllowed ? undefined : `Not available above ${formatINR(COD_LIMIT)}` },
  ];

  return (
    <div className="container page">
      <h1 className="page-title">Payment</h1>
      <div className="two-col">
        <form className="panel" onSubmit={pay} noValidate>
          <h3>Total payable: {formatINR(totals.total)}</h3>
          <p className="muted small">Delivering to {address.fullName}, {address.city} – {address.pin}</p>

          <div className="pay-methods" role="radiogroup" aria-label="Payment method">
            {methods.map((m) => (
              <label key={m.id} className={`pay-method ${method === m.id ? 'selected' : ''} ${m.disabled ? 'disabled' : ''}`}>
                <input type="radio" name="method" checked={method === m.id} disabled={m.disabled || processing} onChange={() => choose(m.id)} />
                <span aria-hidden="true">{m.icon}</span> {m.label}
                {m.hint && <small className="muted"> ({m.hint})</small>}
              </label>
            ))}
          </div>

          {method === 'upi' && (
            <TextField label="UPI ID" name="upiId" value={d.upiId} error={errors.upiId} placeholder="yourname@upi" autoComplete="off" onChange={(e) => set('upiId', e.target.value)} />
          )}
          {method === 'card' && (
            <>
              <TextField label="Card number" name="cardNumber" value={d.cardNumber} error={errors.cardNumber} inputMode="numeric" placeholder="1234 5678 9012 3456" maxLength={19} autoComplete="cc-number"
                onChange={(e) => set('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} />
              <TextField label="Name on card" name="cardName" value={d.cardName} error={errors.cardName} autoComplete="cc-name" onChange={(e) => set('cardName', e.target.value)} />
              <div className="form-grid">
                <TextField label="Expiry (MM/YY)" name="expiry" value={d.expiry} error={errors.expiry} inputMode="numeric" placeholder="MM/YY" maxLength={5} autoComplete="cc-exp"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    set('expiry', digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                  }} />
                <TextField label="CVV" name="cvv" type="password" value={d.cvv} error={errors.cvv} inputMode="numeric" maxLength={3} autoComplete="cc-csc" onChange={(e) => set('cvv', e.target.value.replace(/\D/g, ''))} />
              </div>
              <p className="muted small">Test tip: a card number ending in 0000 simulates a declined payment.</p>
            </>
          )}
          {method === 'netbanking' && (
            <div className="field">
              <label htmlFor="bank">Select bank</label>
              <select id="bank" value={d.bank} className={errors.bank ? 'invalid' : ''} onChange={(e) => set('bank', e.target.value)}>
                <option value="">Choose your bank</option>
                {BANKS.map((b) => <option key={b}>{b}</option>)}
              </select>
              {errors.bank && <p className="error-text" role="alert">{errors.bank}</p>}
            </div>
          )}
          {method === 'cod' && <p className="info-box">Pay {formatINR(totals.total)} in cash when your order arrives. Please keep the exact amount ready.</p>}

          {payError && (
            <div className="error-box" role="alert">
              <strong>Payment failed.</strong> {payError}
            </div>
          )}

          <div className="row end">
            <button type="button" className="btn btn-outline" onClick={cancel} disabled={processing}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={processing}>
              {processing ? 'Processing…' : method === 'cod' ? 'Place Order' : `Pay Now • ${formatINR(totals.total)}`}
            </button>
          </div>
          {processing && <p className="muted small center">Please do not refresh or press back while we confirm your payment.</p>}
        </form>

        <OrderSummary items={items} totals={totals} restaurantName={restaurant.name} />
      </div>
    </div>
  );
}
