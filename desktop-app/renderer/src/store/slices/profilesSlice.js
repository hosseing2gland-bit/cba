import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle',
  error: '',
};

const authorizedRequest = (path, token, options = {}) =>
  window.api.request(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

export const fetchProfiles = createAsyncThunk('profiles/fetch', async (_, { getState }) => {
  const token = getState().auth.accessToken;
  return authorizedRequest('/api/profiles', token);
});

export const saveProfile = createAsyncThunk('profiles/save', async (profile, { getState }) => {
  const token = getState().auth.accessToken;
  const method = profile.id ? 'PATCH' : 'POST';
  const path = profile.id ? `/api/profiles/${profile.id}` : '/api/profiles';
  return authorizedRequest(path, token, {
    method,
    body: JSON.stringify(profile),
  });
});

export const deleteProfile = createAsyncThunk('profiles/delete', async (id, { getState }) => {
  const token = getState().auth.accessToken;
  await authorizedRequest(`/api/profiles/${id}`, token, { method: 'DELETE' });
  return id;
});

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        const existing = state.items.findIndex((item) => item.id === action.payload.id);
        if (existing !== -1) {
          state.items[existing] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default profilesSlice.reducer;
