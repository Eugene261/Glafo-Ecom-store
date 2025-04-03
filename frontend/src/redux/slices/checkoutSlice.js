import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to create a checkout session 
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout", 
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`, 
        checkoutData, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`, // Fixed string literal
          }
        }
      );
      return response.data;
    } catch (error) {
      // Improved error handling
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Checkout request failed"
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        // Fixed error handling - action.payload is now the direct message
        state.error = action.payload || "Unknown error occurred";
      });
  }
});

export default checkoutSlice.reducer;