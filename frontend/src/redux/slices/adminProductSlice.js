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
      // Validate required fields
      if (!productData.name || !productData.description || !productData.price) {
        throw new Error('Name, description, and price are required fields');
      }

      if (!Array.isArray(productData.sizes) || productData.sizes.length === 0) {
        throw new Error('At least one size is required');
      }

      if (!Array.isArray(productData.colors) || productData.colors.length === 0) {
        throw new Error('At least one color is required');
      }

      // Format the data before sending
      const formattedData = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        countInStock: Number(productData.countInStock) || 0,
        brand: productData.brand || '',
        category: productData.category,
        gender: productData.gender || 'Unisex',
        sizes: productData.sizes,
        colors: productData.colors,
        collections: productData.collections || [],
        images: Array.isArray(productData.images) 
          ? productData.images.map(img => ({
              url: img.url || '',
              altText: img.altText || 'Product Image'
            }))
          : [],
        sku: productData.sku || `SKU-${Date.now()}`, // Generate a default SKU if not provided
        isFeatured: productData.isFeatured || false,
        isPublished: productData.isPublished !== undefined ? productData.isPublished : true,
        material: productData.material || '',
        tags: productData.tags || []
      };

      const response = await axios.post(
        `${API_URL}/api/products`,
        formattedData,
        getAuthConfig()
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data.product;
    } catch (error) {
      console.error('Product creation error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to create product"
      );
    }
});

// async function to update a product
export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({id, productData}, { rejectWithValue }) => {
    try {
      console.log('Sending update request with data:', productData);
      
      // Ensure images array is properly formatted
      const dataToSend = {
        ...productData,
        images: Array.isArray(productData.images) 
          ? productData.images.map(img => ({
              url: img.url,
              altText: img.altText || 'Product Image'
          }))
          : []
      };

      const response = await axios.put(
        `${API_URL}/api/products/${id}`,
        dataToSend,
        getAuthConfig()
      );
      
      console.log('Update response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update product");
      }
      
      return response.data.product;
    } catch (error) {
      console.error('Update error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
});

// async function to delete product
export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/products/${id}`,
        getAuthConfig()
      );
      return { id }; // Return the id for the reducer to use
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
});

// async function to fetch product details
export const fetchProductDetails = createAsyncThunk(
  "adminProducts/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products/${id}`,
        getAuthConfig()
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product details");
    }
});

const adminProductSlice = createSlice({
    name : "adminProducts",
    initialState: {
        products: [],
        currentProduct: null,
        loading : false,
        error: null
    },
    reducers: {
        clearSelectedProduct: (state) => {
            state.currentProduct = null;
        },
        updateSelectedProduct: (state, action) => {
            state.currentProduct = action.payload;
        }
    },
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

        // Fetch Product Details
        .addCase(fetchProductDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProductDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.currentProduct = action.payload;
        })
        .addCase(fetchProductDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Create Product
        .addCase(createProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.products.push(action.payload);
            state.error = null;
        })
        .addCase(createProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // update Product
        .addCase(updateProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateProduct.fulfilled, (state, action) => {
            state.loading = false;
            // Update in products array
            const index = state.products.findIndex(
                (product) => product._id === action.payload._id
            );
            if (index !== -1) {
                state.products[index] = action.payload;
            }
            // Update currentProduct
            state.currentProduct = action.payload;
            state.error = null;
        })
        .addCase(updateProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Delete Product
        .addCase(deleteProduct.fulfilled, (state, action) => {
            state.products = state.products.filter(
                (product) => product._id !== action.payload.id
            );
        });
    },
});

export const { clearSelectedProduct, updateSelectedProduct } = adminProductSlice.actions;

export default adminProductSlice.reducer;






