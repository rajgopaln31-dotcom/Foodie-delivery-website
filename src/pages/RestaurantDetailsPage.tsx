import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import FavouriteButton from '../components/FavouriteButton';
import FoodModal from '../components/FoodModal';
import Img from '../components/Img';
import QtyStepper from '../components/QtyStepper';
import { CardSkeletons } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { addItem, makeKey, replaceCart, setQuantity, type NewCartItem } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectMenu } from '../store/restaurantSlice';
import type { FoodItem } from '../types';
import { formatINR, toCartItem } from '../utils/pricing';

export default function RestaurantDetailsPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const notify = useToast();

  const status = useAppSelector((s) => s.restaurants.status);
  const restaurant = useAppSelector((s) => s.restaurants.restaurants.find((r) => r.id === id));
  const menu = useAppSelector((s) => selectMenu(s, id));
  const cartItems = useAppSelector((s) => s.cart.items);
  const cartRestaurantId = useAppSelector((s) => s.cart.restaurantId);

  const [pending, setPending] = useState<NewCartItem | null>(null);
  const [active, setActive] = useState('');
  const categories = useMemo(() => Array.from(new Set(menu.map((m) => m.category))), [menu]);
  const selectedFood = menu.find((f) => f.id === params.get('food'));

  if (status === 'idle' || status === 'loading') {
    return <div className="container page"><div className="skeleton" style={{ height: 240, marginBottom: 20 }} /><CardSkeletons count={4} /></div>;
  }
  if (!restaurant) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-emoji">🍽️</div>
          <h3>Restaurant not found</h3>
          <Link className="btn btn-primary" to="/restaurants">Browse restaurants</Link>
        </div>
      </div>
    );
  }

  const addToCart = (item: NewCartItem) => {
    if (cartRestaurantId && cartRestaurantId !== item.restaurantId) {
      setPending(item);
      return;
    }
    dispatch(addItem(item));
    notify(`${item.name} added to cart`, 'success');
  };

  const confirmReplace = () => {
    if (!pending) return;
    dispatch(replaceCart(pending));
    notify(`Cart replaced. ${pending.name} added.`, 'success');
    setPending(null);
  };

  const openFood = (f: FoodItem) => setParams({ food: f.id }, { replace: true });
  const closeFood = () => setParams({}, { replace: true });
  const hasOptions = (f: FoodItem) => f.sizes.length > 0 || f.addons.length > 0;
  const qtyInCart = (f: FoodItem) => cartItems.filter((i) => i.foodId === f.id).reduce((n, i) => n + i.quantity, 0);

  const goTo = (c: string) => {
    setActive(c);
    document.getElementById(`cat-${c.replace(/\s/g, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="container page">
      <section className="rest-banner">
        <Img src={restaurant.image} alt={restaurant.name} emoji={restaurant.emoji} />
        <div className="rest-banner-info">
          <div className="row between">
            <h1>{restaurant.name}</h1>
            <FavouriteButton restaurantId={restaurant.id} name={restaurant.name} />
          </div>
          <p>{restaurant.description}</p>
          <p className="meta">
            <span className="rating">★ {restaurant.rating.toFixed(1)}</span>
            <span>{restaurant.reviews.toLocaleString('en-IN')} reviews</span>
            <span>🕒 {restaurant.deliveryTime} min</span>
            <span>{formatINR(restaurant.priceForTwo)} for two</span>
          </p>
          {restaurant.offer && <span className="tag-offer static">🏷️ {restaurant.offer}</span>}
        </div>
      </section>

      <div className="tabs" role="tablist" aria-label="Menu categories">
        {categories.map((c) => (
          <button key={c} role="tab" aria-selected={(active || categories[0]) === c} className={`tab ${(active || categories[0]) === c ? 'active' : ''}`} onClick={() => goTo(c)}>{c}</button>
        ))}
      </div>

      {categories.map((c) => (
        <section key={c} id={`cat-${c.replace(/\s/g, '-')}`} className="menu-section">
          <h2>{c}</h2>
          <div className="food-grid">
            {menu.filter((f) => f.category === c).map((f) => {
              const simpleItem = cartItems.find((i) => i.key === makeKey(f.id, null, []));
              return (
                <article key={f.id} className={`food-card ${f.available ? '' : 'sold-out'}`}>
                  <button className="food-img" onClick={() => openFood(f)} aria-label={`View details of ${f.name}`}>
                    <Img src={f.image} alt={f.name} emoji={f.emoji} />
                  </button>
                  <div className="food-info">
                    <h3><span className={f.veg ? 'veg-dot' : 'nonveg-dot'} title={f.veg ? 'Veg' : 'Non-veg'} /> {f.name}</h3>
                    <p className="muted small clamp">{f.description}</p>
                    <div className="row between">
                      <strong>{formatINR(f.price)}</strong>
                      {!f.available ? (
                        <span className="tag-soldout">Currently unavailable</span>
                      ) : hasOptions(f) ? (
                        <button className="btn btn-outline btn-sm" onClick={() => openFood(f)}>
                          {qtyInCart(f) > 0 ? `Add more (${qtyInCart(f)})` : 'Customise & Add'}
                        </button>
                      ) : simpleItem ? (
                        <QtyStepper value={simpleItem.quantity} onChange={(v) => dispatch(setQuantity({ key: simpleItem.key, quantity: v }))} />
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => addToCart(toCartItem(f, null, [], 1))}>Add to Cart</button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {selectedFood && (
        <FoodModal
          food={selectedFood}
          restaurantName={restaurant.name}
          onClose={closeFood}
          onAdd={(item) => {
            if (!selectedFood.available) return;
            addToCart(item);
            if (!(cartRestaurantId && cartRestaurantId !== item.restaurantId)) closeFood();
          }}
        />
      )}

      <ConfirmDialog
        open={!!pending}
        title="Replace cart items?"
        message="Your cart contains items from another restaurant. Do you want to clear it and add this item instead?"
        confirmLabel="Yes, replace cart"
        onConfirm={confirmReplace}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
