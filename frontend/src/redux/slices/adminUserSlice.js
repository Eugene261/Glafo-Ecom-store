import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Ensure we're using the correct backend URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

// Helper function to get current token with better error handling
const getAuthConfig = () => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    console.error('No authentication token found in localStorage');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Fetch all users (superAdmin only)
export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAllUsers",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is superAdmin
      const { auth } = getState();
      if (auth.user?.role !== 'superAdmin') {
        return rejectWithValue("Not authorized as super admin");
      }
      
      const response = await axios.get(
        `${API_URL}/api/admin/users`,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        return rejectWithValue("Session expired. Please login again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue("Not authorized as super admin");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
});

// Update user role (superAdmin only)
export const updateUserRole = createAsyncThunk(
  "adminUsers/updateUserRole",
  async ({ userId, role }, { rejectWithValue, getState }) => {
    try {
      // Check if user is superAdmin
      const { auth } = getState();
      if (auth.user?.role !== 'superAdmin') {
        return rejectWithValue("Not authorized as super admin");
      }
      
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}`,
        { role },
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Not authorized as super admin");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to update user role");
    }
});

// Delete user (superAdmin only)
export const deleteUser = createAsyncThunk(
  "adminUsers/deleteUser",
  async (userId, { rejectWithValue, getState }) => {
    try {
      // Check if user is superAdmin
      const { auth } = getState();
      if (auth.user?.role !== 'superAdmin') {
        return rejectWithValue("Not authorized as super admin");
      }
      
      await axios.delete(
        `${API_URL}/api/admin/users/${userId}`,
        getAuthConfig()
      );
      return userId;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Not authorized as super admin");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
});

// Add new user (superAdmin only)
export const addUser = createAsyncThunk(
  "adminUsers/addUser",
  async (userData, { rejectWithValue, getState }) => {
    try {
      // Check if user is superAdmin
      const { auth } = getState();
      if (auth.user?.role !== 'superAdmin') {
        return rejectWithValue("Not authorized as super admin");
      }
      
      const response = await axios.post(
        `${API_URL}/api/admin/users`,
        userData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Not authorized as super admin");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to add user");
    }
});

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      // Add user
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = adminUserSlice.actions;
export default adminUserSlice.reducer; 