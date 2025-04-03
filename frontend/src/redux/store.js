import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js'; 
import productReducer from './slices/productSlice.js';
import cartReducer from './slices/cartSlice.js';
import checkReducer from './slices/checkoutSlice.js';
import orderReducer from './slices/orderSlice.js';
import adminReducer from './slices/adminSlice.js';
import adminProductReducer from './slices/adminProductSlice.js';
import adminOrdersReducer from './slices/adminOrderSlice.js';
import adminAuthReducer from './slices/adminAuthSlice';
import adminUserReducer from './slices/adminUserSlice';
import favoritesReducer from './slices/favoriteSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    checkout: checkReducer,
    orders: orderReducer,
    admin: adminReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrdersReducer,
    adminAuth: adminAuthReducer,
    adminUsers: adminUserReducer,
    favorites: favoritesReducer,
  },
});

export default store;