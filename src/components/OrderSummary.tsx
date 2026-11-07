import type { CartItem } from '../types';
import { formatINR, type Totals } from '../utils/pricing';

export function lineDetails(item: CartItem): string {
  return [item.size?.name, ...item.addons.map((a) => a.name)].filter(Boolean).join(', ');
}

export function PriceSummary({ totals }: { totals: Totals }) {
  return (
    <div className="price-summary">
      <div className="summary-row"><span>Subtotal</span><span>{formatINR(totals.subtotal)}</span></div>
      {totals.discount > 0 && <div className="summary-row discount"><span>Coupon discount</span><span>− {formatINR(totals.discount)}</span></div>}
      <div className="summary-row"><span>Delivery charges</span><span>{totals.delivery === 0 ? 'FREE' : formatINR(totals.delivery)}</span></div>
      <div className="summary-row"><span>Taxes (5% GST)</span><span>{formatINR(totals.tax)}</span></div>
      <div className="summary-row total"><span>Total payable</span><span>{formatINR(totals.total)}</span></div>
    </div>
  );
}

export default function OrderSummary({ items, totals, restaurantName }: { items: CartItem[]; totals: Totals; restaurantName?: string }) {
  return (
    <aside className="panel summary-panel">
      <h3>Order summary</h3>
      {restaurantName && <p className="muted small">From {restaurantName}</p>}
      <ul className="summary-items">
        {items.map((i) => (
          <li key={i.key}>
            <span className={i.veg ? 'veg-dot' : 'nonveg-dot'} />
            <span className="grow">{i.quantity} × {i.name}{lineDetails(i) && <small className="muted"> ({lineDetails(i)})</small>}</span>
            <span>{formatINR(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <PriceSummary totals={totals} />
    </aside>
  );
}
