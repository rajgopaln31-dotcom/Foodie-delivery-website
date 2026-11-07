import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderApi } from '../services/api';
import type { NewOrder, Order, PaymentDetails, Status } from '../types';
import { errorMessage } from './errors';

interface OrderState {
  items: Order[];
  status: Status;
  placing: Status;
  error: string | null;
  placeError: string | null;
}

const initialState: OrderState = { items: [], status: 'idle', placing: 'idle', error: null, placeError: null };

export const placeOrder = createAsyncThunk<Order, { order: NewOrder; payment: PaymentDetails }, { rejectValue: string }>(
  'orders/place',
  async ({ order, payment }, { rejectWithValue }) => {
    try {
      return await orderApi.placeOrder(order, payment);
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Payment failed. Please try again.'));
    }
  },
);

export const fetchOrders = createAsyncThunk<Order[], string, { rejectValue: string }>(
  'orders/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      return await orderApi.list(userId);
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Could not load orders'));
    }
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearPlaceError(state) {
      state.placeError = null;
      state.placing = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (s) => { s.placing = 'loading'; s.placeError = null; })
      .addCase(placeOrder.fulfilled, (s, a) => { s.placing = 'succeeded'; s.items.unshift(a.payload); })
      .addCase(placeOrder.rejected, (s, a) => { s.placing = 'failed'; s.placeError = a.payload ?? 'Payment failed'; })
      .addCase(fetchOrders.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchOrders.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload ?? 'Could not load orders'; });
  },
});

export const { clearPlaceError } = orderSlice.actions;
export default orderSlice.reducer;
