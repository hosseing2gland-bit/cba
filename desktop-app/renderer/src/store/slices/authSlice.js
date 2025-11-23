import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: '',
  refreshToken: '',
  status: 'idle',
  error: '',
};

const safeRequest = async (path, options = {}) => window.api.request(path, options);

export const register = createAsyncThunk('auth/register', async (payload) => {
  const data = await safeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
});

export const login = createAsyncThunk('auth/login', async (payload) => {
  const data = await safeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
});

export const refresh = createAsyncThunk('auth/refresh', async (_, { getState }) => {
  const { auth } = getState();
  if (!auth.refreshToken) throw new Error('Refresh token missing');
  const data = await window.api.refreshToken(auth.refreshToken);
  return data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = '';
      state.refreshToken = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(refresh.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
