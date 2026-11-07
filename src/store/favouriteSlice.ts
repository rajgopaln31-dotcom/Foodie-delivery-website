import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { load } from '../utils/storage';

interface FavouriteState { ids: string[] }

const initialState: FavouriteState = { ids: load<string[]>('fd_favourites', []) };

const favouriteSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    toggleFavourite(state, action: PayloadAction<string>) {
      state.ids = state.ids.includes(action.payload)
        ? state.ids.filter((id) => id !== action.payload)
        : [...state.ids, action.payload];
    },
  },
});

export const { toggleFavourite } = favouriteSlice.actions;
export default favouriteSlice.reducer;
