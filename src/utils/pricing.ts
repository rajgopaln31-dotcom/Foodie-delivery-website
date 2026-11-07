import type { CartItem, FoodItem, Option } from '../types';
import type { NewCartItem } from '../store/cartSlice';

interface CouponRule {
  description: string;
  min: number;
  discount: (subtotal: number) => number;
  freeDelivery?: boolean;
}

export const COUPONS: Record<string, CouponRule> = {
  WELCOME50: { description: '50% off up to ₹100 on orders above ₹200', min: 200, discount: (s) => Math.min(100, s * 0.5) },
  SAVE20: { description: 'Flat ₹20 off on orders above ₹150', min: 150, discount: () => 20 },
  FREEDEL: { description: 'Free delivery on orders above ₹300', min: 300, discount: () => 0, freeDelivery: true },
};

export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_ABOVE = 500;
export const TAX_RATE = 0.05;

export const formatINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export function validateCoupon(code: string, subtotal: number): string | null {
  const rule = COUPONS[code.trim().toUpperCase()];
  if (!rule) return 'Invalid coupon code';
  if (subtotal < rule.min) return `Add items worth ₹${Math.ceil(rule.min - subtotal)} more to use this coupon`;
  return null;
}

export interface Totals { subtotal: number; discount: number; delivery: number; tax: number; total: number }

export function calcTotals(items: CartItem[], couponCode: string | null): Totals {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const rule = couponCode ? COUPONS[couponCode] : undefined;
  const valid = !!rule && subtotal >= rule.min;
  const discount = valid && rule ? Math.min(Math.round(rule.discount(subtotal)), subtotal) : 0;
  const freeDelivery = (valid && !!rule?.freeDelivery) || subtotal >= FREE_DELIVERY_ABOVE;
  const delivery = items.length === 0 || freeDelivery ? 0 : DELIVERY_FEE;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + delivery + tax) * 100) / 100;
  return { subtotal, discount, delivery, tax, total };
}

export function toCartItem(food: FoodItem, size: Option | null, addons: Option[], quantity: number): NewCartItem {
  const unitPrice = food.price + (size?.price ?? 0) + addons.reduce((s, a) => s + a.price, 0);
  return {
    foodId: food.id,
    restaurantId: food.restaurantId,
    name: food.name,
    image: food.image,
    emoji: food.emoji,
    veg: food.veg,
    size,
    addons,
    unitPrice,
    quantity,
  };
}
