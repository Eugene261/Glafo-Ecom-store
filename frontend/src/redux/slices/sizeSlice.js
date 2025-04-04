import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchSizes = createAsyncThunk(
    "sizes/fetchSizes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/sizes`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch sizes");
        }
    }
);

export const createSize = createAsyncThunk(
    "sizes/createSize",
    async (sizeData, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            };
            const response = await axios.post(`${API_URL}/api/admin/sizes`, sizeData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create size");
        }
    }
);

export const updateSize = createAsyncThunk(
    "sizes/updateSize",
    async ({ id, sizeData }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            };
            const response = await axios.put(`${API_URL}/api/admin/sizes/${id}`, sizeData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update size");
        }
    }
);

export const deleteSize = createAsyncThunk(
    "sizes/deleteSize",
    async (id, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    ...getAuthHeader()
                }
            };
            await axios.delete(`${API_URL}/api/admin/sizes/${id}`, config);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete size");
        }
    }
);

// Slice
const sizeSlice = createSlice({
    name: "sizes",
    initialState: {
        sizes: [],
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch sizes
            .addCase(fetchSizes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSizes.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes = action.payload;
                state.error = null;
            })
            .addCase(fetchSizes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create size
            .addCase(createSize.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createSize.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes.push(action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(createSize.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Update size
            .addCase(updateSize.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateSize.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes = state.sizes.map(size =>
                    size._id === action.payload._id ? action.payload : size
                );
                state.success = true;
                state.error = null;
            })
            .addCase(updateSize.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Delete size
            .addCase(deleteSize.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteSize.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes = state.sizes.filter(size => size._id !== action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(deleteSize.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { clearError, clearSuccess } = sizeSlice.actions;
export default sizeSlice.reducer; 