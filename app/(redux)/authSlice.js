import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadUserFromStorage = async () => {
  try {
    const userInfo = await AsyncStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("Failed to load user info", error);
    return null;
  }
};

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  profileImage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (state, action) => {
      const { user, token } = action.payload;
      if (user) {
        state.user = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userId: user._id,
          token: token,
        };
        state.isAuthenticated = true;
        state.loading = false;
      }
    },
    logoutAction: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setUser: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Remove fetchProfileImage logic
  },
});

export const selectUser = (state) => state.auth;

export const { loginAction, logoutAction, setUser, setLoading } = authSlice.actions;

export default authSlice.reducer;

export const loadUser = () => async (dispatch) => {
  const user = await loadUserFromStorage();
  if (user) {
    dispatch(setUser(user));
  } else {
    dispatch(setLoading(false));
  }
};