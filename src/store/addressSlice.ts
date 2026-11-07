import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Address, AddressInput } from '../types';
import { load } from '../utils/storage';
import type { RootState } from './index';

interface AddressState { items: Address[]; selectedId: string | null }

const initialState: AddressState = load<AddressState>('fd_addresses', { items: [], selectedId: null });

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    addAddress(state, action: PayloadAction<AddressInput>) {
      const isDefault = action.payload.isDefault || state.items.length === 0;
      if (isDefault) state.items.forEach((a) => { a.isDefault = false; });
      const address: Address = { ...action.payload, isDefault, id: `a${Date.now()}` };
      state.items.push(address);
      state.selectedId = address.id;
    },
    updateAddress(state, action: PayloadAction<Address>) {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx === -1) return;
      if (action.payload.isDefault) state.items.forEach((a) => { a.isDefault = false; });
      state.items[idx] = action.payload;
    },
    deleteAddress(state, action: PayloadAction<string>) {
      const removed = state.items.find((a) => a.id === action.payload);
      state.items = state.items.filter((a) => a.id !== action.payload);
      if (removed?.isDefault && state.items.length > 0) state.items[0].isDefault = true;
      if (state.selectedId === action.payload) {
        state.selectedId = (state.items.find((a) => a.isDefault) ?? state.items[0])?.id ?? null;
      }
    },
    selectAddress(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    setDefaultAddress(state, action: PayloadAction<string>) {
      state.items.forEach((a) => { a.isDefault = a.id === action.payload; });
    },
  },
});

export const { addAddress, updateAddress, deleteAddress, selectAddress, setDefaultAddress } = addressSlice.actions;

export const selectSelectedAddress = (s: RootState): Address | undefined => {
  const { items, selectedId } = s.addresses;
  return items.find((a) => a.id === selectedId) ?? items.find((a) => a.isDefault);
};

export default addressSlice.reducer;
