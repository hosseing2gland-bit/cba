import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profilesReducer from './slices/profilesSlice';
import teamsReducer from './slices/teamsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: profilesReducer,
    teams: teamsReducer,
  },
});
