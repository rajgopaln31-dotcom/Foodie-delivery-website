import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types';
import { calcTotals } from '../utils/pricing';
import { load } from '../utils/storage';
import type { RootState } from './index';

export type NewCartItem = Omit<CartItem, 'key'>;

interface CartState { items: CartItem[]; restaurantId: string | null; couponCode: string | null }

const MAX_QTY = 20;

const initialState: CartState = load<CartState>('fd_cart', { items: [], restaurantId: null, couponCode: null });

export const makeKey = (foodId: string, size: { name: string } | null, addons: { name: string }[]): string =>
  [foodId, size?.name ?? '', ...addons.map((a) => a.name).sort()].join('|');

function insert(state: CartState, item: NewCartItem): void {
  const key = makeKey(item.foodId, item.size, item.addons);
  const existing = state.items.find((i) => i.key === key);
  if (existing) existing.quantity = Math.min(MAX_QTY, existing.quantity + item.quantity);
  else state.items.push({ ...item, key, quantity: Math.min(MAX_QTY, item.quantity) });
  state.restaurantId = item.restaurantId;
}

function normalise(state: CartState): void {
  if (state.items.length === 0) {
    state.restaurantId = null;
    state.couponCode = null;
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<NewCartItem>) {
      insert(state, action.payload);
    },
    /** Used after the customer confirms replacing a cart that belongs to another restaurant. */
    replaceCart(state, action: PayloadAction<NewCartItem>) {
      state.items = [];
      state.couponCode = null;
      insert(state, action.payload);
    },
    setQuantity(state, action: PayloadAction<{ key: string; quantity: number }>) {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.key !== key);
      } else {
        const item = state.items.find((i) => i.key === key);
        if (item) item.quantity = Math.min(MAX_QTY, quantity);
      }
      normalise(state);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.key !== action.payload);
      normalise(state);
    },
    clearCart(state) {
      state.items = [];
      normalise(state);
    },
    applyCoupon(state, action: PayloadAction<string>) {
      state.couponCode = action.payload.trim().toUpperCase();
    },
    removeCoupon(state) {
      state.couponCode = null;
    },
  },
});

export const { addItem, replaceCart, setQuantity, removeItem, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

export const selectCartItems = (s: RootState): CartItem[] => s.cart.items;
export const selectCartCount = (s: RootState): number => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotals = createSelector(
  [(s: RootState) => s.cart.items, (s: RootState) => s.cart.couponCode],
  (items, code) => calcTotals(items, code),
);

export default cartSlice.reducer;
