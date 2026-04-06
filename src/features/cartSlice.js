import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  selectedTable: localStorage.getItem('selectedTable') ? JSON.parse(localStorage.getItem('selectedTable')) : null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; 
      // A unique item is either a menuItem or a dealId
      const existItem = state.cartItems.find((x) => 
        item.isDeal ? x.dealId === item.dealId : x.menuItem === item.menuItem
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          (item.isDeal ? x.dealId === item.dealId : x.menuItem === item.menuItem) 
            ? { ...item, qty: x.qty + item.qty } : x
        );
      } else {
        state.cartItems = [...state.cartItems, { ...item, selected: true }];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      // Find item by ID (which could be menuItem or dealId)
      state.cartItems = state.cartItems.filter((x) => x.menuItem !== action.payload && x.dealId !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartQty: (state, action) => {
      const { id, qty, isDeal } = action.payload;
      const item = state.cartItems.find((x) => isDeal ? x.dealId === id : x.menuItem === id);
      if (item) {
        item.qty = Math.max(1, qty);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    toggleItemSelection: (state, action) => {
      const { id, isDeal } = action.payload;
      const item = state.cartItems.find((x) => isDeal ? x.dealId === id : x.menuItem === id);
      if (item) {
        item.selected = !item.selected;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload;
      localStorage.setItem('selectedTable', JSON.stringify(action.payload));
    },
    removeSelectedFromCart: (state) => {
      state.cartItems = state.cartItems.filter((x) => !x.selected);
      state.selectedTable = null;
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      localStorage.removeItem('selectedTable');
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.selectedTable = null;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('selectedTable');
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateCartQty, 
  toggleItemSelection, 
  setSelectedTable, 
  removeSelectedFromCart, 
  clearCart 
} = cartSlice.actions;
export default cartSlice.reducer;


