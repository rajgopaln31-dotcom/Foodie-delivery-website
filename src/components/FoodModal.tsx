import { useEffect, useMemo, useState } from 'react';
import type { FoodItem, Option } from '../types';
import type { NewCartItem } from '../store/cartSlice';
import { formatINR, toCartItem } from '../utils/pricing';
import Img from './Img';
import QtyStepper from './QtyStepper';

interface Props {
  food: FoodItem;
  restaurantName: string;
  onClose: () => void;
  onAdd: (item: NewCartItem) => void;
}

/** Screen 5 (part 1): food details with customisation, add-ons, quantity and live price. */
export default function FoodModal({ food, restaurantName, onClose, onAdd }: Props) {
  const [size, setSize] = useState<Option | null>(food.sizes[0] ?? null);
  const [addons, setAddons] = useState<Option[]>([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const item = useMemo(() => toCartItem(food, size, addons, qty), [food, size, addons, qty]);
  const toggleAddon = (a: Option) =>
    setAddons((cur) => (cur.some((x) => x.name === a.name) ? cur.filter((x) => x.name !== a.name) : [...cur, a]));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={food.name} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close" aria-label="Close" onClick={onClose}>✕</button>
        <Img className="modal-img" src={food.image} alt={food.name} emoji={food.emoji} />
        <div className="modal-body">
          <div className="row between">
            <h2><span className={food.veg ? 'veg-dot' : 'nonveg-dot'} title={food.veg ? 'Veg' : 'Non-veg'} /> {food.name}</h2>
            <strong>{formatINR(food.price)}</strong>
          </div>
          <p className="muted small">From {restaurantName}</p>
          <p>{food.description}</p>

          {food.sizes.length > 0 && (
            <fieldset className="options">
              <legend>Choose size</legend>
              {food.sizes.map((s) => (
                <label key={s.name} className="option">
                  <input type="radio" name="size" checked={size?.name === s.name} onChange={() => setSize(s)} />
                  <span>{s.name}</span>
                  <em>{s.price ? `+ ${formatINR(s.price)}` : 'Included'}</em>
                </label>
              ))}
            </fieldset>
          )}

          {food.addons.length > 0 && (
            <fieldset className="options">
              <legend>Add-ons / toppings (optional)</legend>
              {food.addons.map((a) => (
                <label key={a.name} className="option">
                  <input type="checkbox" checked={addons.some((x) => x.name === a.name)} onChange={() => toggleAddon(a)} />
                  <span>{a.name}</span>
                  <em>+ {formatINR(a.price)}</em>
                </label>
              ))}
            </fieldset>
          )}

          <div className="modal-footer">
            <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
            <button className="btn btn-primary grow" onClick={() => onAdd(item)}>
              Add to Cart • {formatINR(item.unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
