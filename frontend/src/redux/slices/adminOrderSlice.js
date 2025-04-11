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

// fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/orders`,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        return rejectWithValue("Session expired. Please login again.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
});

// Order delivery status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      console.log(`Attempting to update order ${id} to status ${status}`);
      
      // Use the consistent auth config helper
      const response = await axios.put(
        `${API_URL}/api/admin/orders/${id}`,
        { status },
        getAuthConfig()
      );
      
      console.log('Order status update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error("Update order status error:", error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        return rejectWithValue("Session expired. Please login again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue("Not authorized to update this order.");
      }
      if (error.response?.status === 404) {
        return rejectWithValue("Order not found.");
      }
      
      return rejectWithValue(error.response?.data?.message || "Failed to update order status");
    }
});

// Delete order
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/orders/${id}`,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
});

const adminOrderSlice = createSlice({
    name : "adminOrders",
    initialState: {
        orders : [],
        totalOrders : 0,
        totalSales: 0,
        loading: false,
        error : null
    },
    reducers: {},
    extraReducers : (builder) => {
        builder
        // Fetch all orders
        .addCase(fetchAllOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAllOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
            state.totalOrders = action.payload.length;
            
            // calculate total sales
            const totalSales = action.payload.reduce((total, order) => {
                return total + order.totalPrice;
            }, 0);
            state.totalSales = totalSales;
        })

        .addCase(fetchAllOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || action.payload || 'Failed to fetch orders';
        })


        // Update order status
        .addCase(updateOrderStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateOrderStatus.fulfilled, (state, action) => {
            state.loading = false;
            const updatedOrder = action.payload;
            const orderIndex = state.orders.findIndex((order) => order._id === updatedOrder._id);
            if(orderIndex !== -1){
                // Preserve any existing user data if not present in the update
                state.orders[orderIndex] = {
                    ...state.orders[orderIndex],
                    ...updatedOrder,
                    user: updatedOrder.user || state.orders[orderIndex].user
                };
            }
        })
        .addCase(updateOrderStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to update order status";
        })

        // Delete Order
        .addCase(deleteOrder.fulfilled, (state, action) => {
            state.orders = state.orders.filter(
                (order) => order._id !== action.payload
            );
        });

    },
});

export default adminOrderSlice.reducer;

