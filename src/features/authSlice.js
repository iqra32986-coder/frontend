import { createSlice } from '@reduxjs/toolkit';

const userToken = localStorage.getItem('userToken') ? localStorage.getItem('userToken') : null;
const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

const initialState = {
  userInfo,
  userToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.userToken = action.payload.token;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      localStorage.setItem('userToken', action.payload.token);
    },
    logout: (state) => {
      state.userInfo = null;
      state.userToken = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
