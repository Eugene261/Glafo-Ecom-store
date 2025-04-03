import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;

// Helper function to get current token
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`
  }
});

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
      const response = await axios.put(
        `${API_URL}/api/admin/orders/${id}`,
        { status },
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
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
            state.error = action.payload.message;
        })


        // Update order status
        .addCase(updateOrderStatus.fulfilled, (state, action) => {
            const updatedOrder = action.payload;
            const orderIndex = state.orders.findIndex((order) => order._id === updatedOrder._id);
            if(orderIndex !== -1){
                state.orders[orderIndex] = updatedOrder;
            }
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

