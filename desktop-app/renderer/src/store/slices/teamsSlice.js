import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
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

export const fetchTeam = createAsyncThunk('teams/fetch', async (_, { getState }) => {
  const token = getState().auth.accessToken;
  return authorizedRequest('/api/team', token);
});

export const inviteMember = createAsyncThunk('teams/invite', async (email, { getState }) => {
  const token = getState().auth.accessToken;
  return authorizedRequest('/api/team/invite', token, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
});

export const updateRole = createAsyncThunk('teams/updateRole', async ({ memberId, role }, { getState }) => {
  const token = getState().auth.accessToken;
  return authorizedRequest(`/api/team/${memberId}/role`, token, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
});

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.members = action.payload.members || [];
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const idx = state.members.findIndex((member) => member.id === action.payload.id);
        if (idx !== -1) {
          state.members[idx] = action.payload;
        }
      });
  },
});

export default teamsSlice.reducer;
