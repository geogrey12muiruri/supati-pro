import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  auth: authReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;