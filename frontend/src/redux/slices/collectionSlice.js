import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchCollections = createAsyncThunk(
    "collections/fetchCollections",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/collections`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch collections");
        }
    }
);

export const createCollection = createAsyncThunk(
    "collections/createCollection",
    async (collectionData, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            };
            const response = await axios.post(`${API_URL}/api/admin/collections`, collectionData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create collection");
        }
    }
);

export const updateCollection = createAsyncThunk(
    "collections/updateCollection",
    async ({ id, collectionData }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            };
            const response = await axios.put(`${API_URL}/api/admin/collections/${id}`, collectionData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update collection");
        }
    }
);

export const deleteCollection = createAsyncThunk(
    "collections/deleteCollection",
    async (id, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    ...getAuthHeader()
                }
            };
            await axios.delete(`${API_URL}/api/admin/collections/${id}`, config);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete collection");
        }
    }
);

// Slice
const collectionSlice = createSlice({
    name: "collections",
    initialState: {
        collections: [],
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
            // Fetch collections
            .addCase(fetchCollections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollections.fulfilled, (state, action) => {
                state.loading = false;
                state.collections = action.payload;
                state.error = null;
            })
            .addCase(fetchCollections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create collection
            .addCase(createCollection.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.collections.push(action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(createCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Update collection
            .addCase(updateCollection.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.collections = state.collections.map(collection =>
                    collection._id === action.payload._id ? action.payload : collection
                );
                state.success = true;
                state.error = null;
            })
            .addCase(updateCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Delete collection
            .addCase(deleteCollection.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.collections = state.collections.filter(collection => collection._id !== action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(deleteCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { clearError, clearSuccess } = collectionSlice.actions;
export default collectionSlice.reducer; 