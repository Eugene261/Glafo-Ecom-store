import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/apiConfig';

// Helper function to get auth config
const getAuthConfig = () => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    console.error('No authentication token found in localStorage');
    throw new Error('No authentication token found');
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Fetch admin revenue data
export const fetchAdminRevenue = createAsyncThunk(
  'revenue/fetchAdminRevenue',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching admin revenue data from slice...');
      const config = getAuthConfig();
      const apiUrl = `${API_URL}/api/orders/admin-revenue`;
      console.log('API URL:', apiUrl);
      
      const { data } = await axios.get(apiUrl, config);
      console.log('Admin revenue data received:', data);
      
      // Validate the data structure
      if (!data || !Array.isArray(data.labels) || !Array.isArray(data.values)) {
        console.error('Invalid data structure received from API:', data);
        return rejectWithValue('Invalid data structure received from API');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching admin revenue:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("userToken");
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin revenue data');
    }
  }
);

// Fetch super admin revenue data
export const fetchSuperAdminRevenue = createAsyncThunk(
  'revenue/fetchSuperAdminRevenue',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching super admin revenue data from slice...');
      const config = getAuthConfig();
      const apiUrl = `${API_URL}/api/orders/super-admin-revenue`;
      console.log('API URL:', apiUrl);
      
      const { data } = await axios.get(apiUrl, config);
      console.log('Super admin revenue data received:', data);
      
      // Validate the data structure
      if (!data || !data.totalRevenue) {
        console.error('Invalid data structure received from API:', data);
        return rejectWithValue('Invalid data structure received from API');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching super admin revenue:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("userToken");
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch super admin revenue data');
    }
  }
);

const revenueSlice = createSlice({
  name: 'revenue',
  initialState: {
    adminRevenue: null,
    superAdminRevenue: null,
    loading: false,
    error: null
  },
  reducers: {
    clearRevenueError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin revenue
      .addCase(fetchAdminRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.adminRevenue = action.payload;
      })
      .addCase(fetchAdminRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admin revenue data';
      })
      
      // Super admin revenue
      .addCase(fetchSuperAdminRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.superAdminRevenue = action.payload;
      })
      .addCase(fetchSuperAdminRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch super admin revenue data';
      });
  }
});

export const { clearRevenueError } = revenueSlice.actions;
export default revenueSlice.reducer;
