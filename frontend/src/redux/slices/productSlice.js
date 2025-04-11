import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunks
export const fetchProductsByFilters = createAsyncThunk(
  "products/fetchByFilters", 
  async (filters, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`
      );

      // Check if this is a request for recommended products
      if (filters.isRecommended) {
        return response.data.products || [];
      }

      return response.data;
    } catch (error) {
      console.error("Products Fetch Error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
      );
      
      if (!response.data.success || !response.data.product) {
        throw new Error(response.data.message || "Failed to fetch product details");
      }

      return response.data.product;
    } catch (error) {
      console.error("Product Details Fetch Error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch product details"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update product");
      }

      return response.data.product;
    } catch (error) {
      console.error("Product Update Error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch similar products");
      }

      // Ensure we're returning an array of products
      return Array.isArray(response.data.products) 
        ? response.data.products 
        : Array.isArray(response.data) 
          ? response.data 
          : [];
    } catch (error) {
      console.error("Similar Products Fetch Error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch similar products");
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  "products/fetchBestSellers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`,
        {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Best seller API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch best seller");
      }

      return response.data.product;
    } catch (error) {
      console.error("Best Seller Fetch Error:", error);
      
      // For network errors (no response)
      if (!error.response) {
        console.error("Network error - no response");
        return rejectWithValue("Network error. Please check your connection.");
      }
      
      // For timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error("Request timed out");
        return rejectWithValue("Request timed out. The server took too long to respond.");
      }
      
      // For CORS errors
      if (error.message && error.message.includes('Network Error')) {
        console.error("CORS or Network error");
        return rejectWithValue("Network error. This might be a CORS issue.");
      }
      
      // For other errors
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch best seller");
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  "products/fetchNewArrivals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`,
        {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('New arrivals API response:', response.data);
      
      // Ensure we're returning the products array
      return Array.isArray(response.data.products) ? response.data.products : [];
    } catch (error) {
      console.error("New Arrivals Fetch Error:", error);
      
      // For network errors (no response)
      if (!error.response) {
        console.error("Network error - no response");
        return rejectWithValue("Network error. Please check your connection.");
      }
      
      // For timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error("Request timed out");
        return rejectWithValue("Request timed out. The server took too long to respond.");
      }
      
      // For CORS errors
      if (error.message && error.message.includes('Network Error')) {
        console.error("CORS or Network error");
        return rejectWithValue("Network error. This might be a CORS issue.");
      }
      
      // For other errors
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch new arrivals");
    }
  }
);

// Slice
const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    selectedProduct: null,
    similarProducts: [],
    bestSellers: [],
    newArrivals: [],
    recommendedProducts: [],
    loading: false,
    bestSellersLoading: false,
    newArrivalsLoading: false,
    recommendedLoading: false,
    error: null,
    bestSellersError: null,
    newArrivalsError: null,
    recommendedError: null,
    filters: {
      category: "",
      size: "",
      color: "",
      gender: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "",
      search: "",
      material: "",
      collection: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: "",
        size: "",
        color: "",
        gender: "",
        brand: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
        search: "",
        material: "",
        collection: "",
      };
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    updateSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Products by filters
      .addCase(fetchProductsByFilters.pending, (state, action) => {
        // Check if this is a request for recommended products
        if (action.meta.arg.isRecommended) {
          state.recommendedLoading = true;
          state.recommendedError = null;
        } else {
          state.loading = true;
          state.error = null;
        }
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        // Check if this is a request for recommended products
        if (action.meta.arg.isRecommended) {
          state.recommendedLoading = false;
          state.recommendedProducts = action.payload;
          state.recommendedError = null;
        } else {
          state.loading = false;
          state.products = action.payload.products || [];
          state.error = null;
        }
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        // Check if this is a request for recommended products
        if (action.meta.arg.isRecommended) {
          state.recommendedLoading = false;
          state.recommendedError = action.payload;
        } else {
          state.loading = false;
          state.error = action.payload;
        }
      })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
        // Update in products array if exists
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      // Similar products
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Best sellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.bestSellersLoading = true;
        state.bestSellersError = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellersLoading = false;
        state.bestSellers = [action.payload];
        state.bestSellersError = null;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.bestSellersLoading = false;
        state.bestSellers = [];
        state.bestSellersError = action.payload;
      })

      // New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.newArrivalsLoading = true;
        state.newArrivalsError = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivalsLoading = false;
        state.newArrivals = action.payload;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.newArrivalsLoading = false;
        state.newArrivalsError = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters,
  clearSelectedProduct,
  updateSelectedProduct
} = productsSlice.actions;

export default productsSlice.reducer;