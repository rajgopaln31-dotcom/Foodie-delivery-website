import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AddressForm from '../components/AddressForm';
import ConfirmDialog from '../components/ConfirmDialog';
import OrderSummary from '../components/OrderSummary';
import { useToast } from '../components/Toast';
import { addAddress, deleteAddress, selectAddress, setDefaultAddress, updateAddress } from '../store/addressSlice';
import { selectCartTotals } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Address, AddressInput } from '../types';

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const items = useAppSelector((s) => s.cart.items);
  const restaurantId = useAppSelector((s) => s.cart.restaurantId);
  const restaurant = useAppSelector((s) => s.restaurants.restaurants.find((r) => r.id === restaurantId));
  const totals = useAppSelector(selectCartTotals);
  const { items: addresses, selectedId } = useAppSelector((s) => s.addresses);
  const selected = addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.isDefault);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | undefined>();
  const [toDelete, setToDelete] = useState<Address | null>(null);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const save = (value: AddressInput) => {
    if (editing) {
      dispatch(updateAddress({ ...value, id: editing.id }));
      notify('Address updated', 'success');
    } else {
      dispatch(addAddress(value));
      notify('Address added', 'success');
    }
    setShowForm(false);
    setEditing(undefined);
  };

  const placeOrder = () => {
    if (!selected) { notify('Please select or add a delivery address', 'error'); return; }
    dispatch(selectAddress(selected.id));
    navigate('/payment');
  };

  return (
    <div className="container page">
      <h1 className="page-title">Delivery address</h1>
      <div className="two-col">
        <section>
          {addresses.length === 0 && !showForm && (
            <div className="panel empty-inline"><p className="muted">You have no saved addresses yet. Add one to continue.</p></div>
          )}

          <div className="address-list" role="radiogroup" aria-label="Saved addresses">
            {addresses.map((a) => (
              <div key={a.id} className={`panel address-card ${selected?.id === a.id ? 'selected' : ''}`}>
                <label className="address-pick">
                  <input type="radio" name="address" checked={selected?.id === a.id} onChange={() => dispatch(selectAddress(a.id))} />
                  <div>
                    <strong>{a.fullName}</strong> {a.isDefault && <span className="tag">Default</span>}
                    <p className="small">{a.house}, {a.street}{a.landmark ? `, ${a.landmark}` : ''}</p>
                    <p className="small">{a.city}, {a.state} – {a.pin}</p>
                    <p className="small muted">📞 {a.mobile}{a.instructions ? ` • ${a.instructions}` : ''}</p>
                  </div>
                </label>
                <div className="row">
                  <button className="link-btn" onClick={() => { setEditing(a); setShowForm(true); }}>Edit</button>
                  <button className="link-btn danger" onClick={() => setToDelete(a)}>Delete</button>
                  {!a.isDefault && <button className="link-btn" onClick={() => { dispatch(setDefaultAddress(a.id)); notify('Default address updated', 'success'); }}>Set as default</button>}
                </div>
              </div>
            ))}
          </div>

          {showForm ? (
            <AddressForm initial={editing} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(undefined); }} />
          ) : (
            <button className="btn btn-outline" onClick={() => setShowForm(true)}>＋ Add New Address</button>
          )}
        </section>

        <div>
          <OrderSummary items={items} totals={totals} restaurantName={restaurant?.name} />
          <button className="btn btn-primary btn-block" onClick={placeOrder} disabled={showForm}>Place Order</button>
          <p className="muted small center">You will choose a payment method on the next step.</p>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Delete address?"
        message={toDelete ? `${toDelete.house}, ${toDelete.street}, ${toDelete.city} will be removed.` : ''}
        confirmLabel="Delete"
        onConfirm={() => { if (toDelete) dispatch(deleteAddress(toDelete.id)); setToDelete(null); notify('Address deleted', 'info'); }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
