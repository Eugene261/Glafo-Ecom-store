import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;

// Helper function to get current token
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`
  }
});

// async Thunk to fetch admin products
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/products`, 
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        return rejectWithValue("Session expired. Please login again.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// async function to create a new product
export const createProduct = createAsyncThunk(
  "adminProducts/createProduct", 
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/products`,
        productData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create product");
    }
});

// async function to update a product
export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({id, productData}, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/products/${id}`,
        productData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
});

// async function to delete product
export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/products/${id}`,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
});

const adminProductSlice = createSlice({
    name : "adminProducts",
    initialState: {
        products: [],
        loading : false,
        error: null
    },
    reducers: {},
    extraReducers : (builder) => {
        builder
        .addCase(fetchAdminProducts.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchAdminProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload;
        })
        .addCase(fetchAdminProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })

        // Create Product
        .addCase(createProduct.fulfilled, (state, action) => {
            state.products.push(action.payload);
        })
        // update Product
        .addCase(updateProduct.fulfilled, (state, action) => {
            const index = state.products.findIndex(
                (product) => product._id = action.payload._id
            );
            if (index !== -1){
                state.products[index] = action.payload;
            }
        })

        // Delete Product
        .addCase(deleteProduct.fulfilled, (state, action) => {
            state.products.filter(
                (product) => product._id !== action.payload);
        });
    },
});

export default adminProductSlice.reducer;






