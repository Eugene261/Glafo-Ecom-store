import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/config';

// Retrieve user info and token from localStorage with safety checks
let userFromStorage = null;
try {
  const userInfoString = localStorage.getItem("userInfo");
  if (userInfoString && userInfoString !== 'undefined') {
    userFromStorage = JSON.parse(userInfoString);
  }
} catch (error) {
  console.error('Error parsing user info from localStorage:', error);
  // Clear the invalid data
  localStorage.removeItem("userInfo");
}

// Check for an existing guest ID in the localStorage or generate a new one
const initialGuestId = localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

// Helper functions for role checking
export const isAdmin = (user) => user?.role === 'admin' || user?.role === 'superAdmin';
export const isSuperAdmin = (user) => user?.role === 'superAdmin';

// Initial state
const initialState = {
    user: userFromStorage,
    guestId: initialGuestId,
    loading: false,
    error: null,
    isAdmin: userFromStorage ? isAdmin(userFromStorage) : false,
    isSuperAdmin: userFromStorage ? isSuperAdmin(userFromStorage) : false
};

// Async Thunk for User Register 
export const registerUser = createAsyncThunk("auth/register", async (userData, {rejectWithValue}) => {
    try {
        console.log('Register request to:', `${API_URL}/api/users/register`);
        console.log('Register data:', userData);
        
        const response = await axios.post(`${API_URL}/api/users/register`, userData);
        console.log('Register response:', response.data);
        
        // The backend returns the user data directly in the response, not nested under a 'user' property
        localStorage.setItem("userInfo", JSON.stringify(response.data));
        localStorage.setItem("userToken", response.data.token);

        return response.data; // Return the user data directly
    } catch (error) {
        console.error('Register error:', error.response?.data || error.message);
        return rejectWithValue(error.response?.data || { message: 'Registration failed' })
    }
});

// Async Thunk for User Login
export const loginUser = createAsyncThunk("auth/login", async (userData, {rejectWithValue}) => {
    try {
        console.log('Login request to:', `${API_URL}/api/users/login`);
        console.log('Login data:', userData);
        
        const response = await axios.post(`${API_URL}/api/users/login`, userData);
        console.log('Login response:', response.data);
        
        // Ensure we have valid data before storing it
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response data format');
        }
        
        // Store user data safely
        if (response.data) {
            localStorage.setItem("userInfo", JSON.stringify(response.data));
            if (response.data.token) {
                localStorage.setItem("userToken", response.data.token);
            }
        }

        return response.data; // Return the user data directly
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        // Clear any potentially corrupted data
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userToken");
        return rejectWithValue(error.response?.data || { message: 'Login failed: ' + (error.message || 'Unknown error') })
    }
});

// Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.guestId = `guest_${new Date().getTime()}`;
            state.isAdmin = false;
            state.isSuperAdmin = false;
            localStorage.removeItem("userInfo");
            localStorage.removeItem("userToken");
            localStorage.setItem("guestId", state.guestId);
        },
        generateNewGuestId: (state) => {
            state.guestId = `guest_${new Date().getTime()}`;
            localStorage.setItem("guestId", state.guestId);
        }
    },
    extraReducers: (builder) => {
        builder
        // Login Cases
        .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAdmin = isAdmin(action.payload);
            state.isSuperAdmin = isSuperAdmin(action.payload);
            state.error = null;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.user = null;
            state.error = action.payload?.message || 'Login failed';
        })
        // Register Cases
        .addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.error = null;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.user = null;
            state.error = action.payload?.message || 'Registration failed';
        });
    }
});

export const {logout, generateNewGuestId} = authSlice.actions;
export default authSlice.reducer;