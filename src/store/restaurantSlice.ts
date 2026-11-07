import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { catalogApi } from '../services/api';
import type { FoodItem, Restaurant, Status } from '../types';
import { load } from '../utils/storage';
import { errorMessage } from './errors';
import type { RootState } from './index';

interface RestaurantState {
  restaurants: Restaurant[];
  foods: FoodItem[];
  status: Status;
  error: string | null;
  location: string;
}

const initialState: RestaurantState = {
  restaurants: [],
  foods: [],
  status: 'idle',
  error: null,
  location: load<string>('fd_location', 'Guntur'),
};

export const fetchCatalog = createAsyncThunk('restaurants/fetchCatalog', async (_: void, { rejectWithValue }) => {
  try {
    return await catalogApi.fetchCatalog();
  } catch (e) {
    return rejectWithValue(errorMessage(e, 'Could not load restaurants'));
  }
});

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchCatalog.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.restaurants = a.payload.restaurants;
        s.foods = a.payload.foods;
      })
      .addCase(fetchCatalog.rejected, (s, a) => {
        s.status = 'failed';
        s.error = (a.payload as string | undefined) ?? 'Could not load restaurants';
      });
  },
});

export const { setLocation } = restaurantSlice.actions;

export const selectMenu = createSelector(
  [(s: RootState) => s.restaurants.foods, (_s: RootState, restaurantId: string) => restaurantId],
  (foods, restaurantId) => foods.filter((f) => f.restaurantId === restaurantId),
);

export default restaurantSlice.reducer;
