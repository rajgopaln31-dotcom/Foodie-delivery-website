import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../services/api';
import type { Status, User } from '../types';
import { load, remove, save } from '../utils/storage';
import { errorMessage } from './errors';

interface AuthState { user: User | null; status: Status; error: string | null }

const initialState: AuthState = { user: load<User | null>('fd_user', null), status: 'idle', error: null };

export const login = createAsyncThunk<User, { identifier: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      return await authApi.login(identifier, password);
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Login failed'));
    }
  },
);

export const register = createAsyncThunk<
  User,
  { name: string; email: string; mobile: string; password: string },
  { rejectValue: string }
>('auth/register', async (input, { rejectWithValue }) => {
  try {
    return await authApi.register(input);
  } catch (e) {
    return rejectWithValue(errorMessage(e, 'Registration failed'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      remove('fd_user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.status = 'succeeded'; s.user = a.payload; save('fd_user', a.payload); })
      .addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload ?? 'Login failed'; })
      .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, (s) => { s.status = 'succeeded'; })
      .addCase(register.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload ?? 'Registration failed'; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
