import { configureStore } from '@reduxjs/toolkit';
import varietiesReducer from './slices/varietiesSlice';

export const store = configureStore({
  reducer: {
    varieties: varietiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
