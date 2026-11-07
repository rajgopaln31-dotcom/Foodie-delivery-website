import { configureStore } from '@reduxjs/toolkit';
import addresses from './addressSlice';
import auth from './authSlice';
import cart from './cartSlice';
import favourites from './favouriteSlice';
import orders from './orderSlice';
import restaurants from './restaurantSlice';
import { save } from '../utils/storage';

export const store = configureStore({
  reducer: { auth, restaurants, cart, addresses, orders, favourites },
});

// Persist the slices that must survive a page refresh.
store.subscribe(() => {
  const s = store.getState();
  save('fd_cart', s.cart);
  save('fd_addresses', s.addresses);
  save('fd_favourites', s.favourites.ids);
  save('fd_location', s.restaurants.location);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
