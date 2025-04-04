import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchColors = createAsyncThunk(
    "colors/fetchColors",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/colors`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch colors");
        }
    }
);

export const createColor = createAsyncThunk(
    "colors/createColor",
    async (colorData, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            };
            const response = await axios.post(`${API_URL}/api/admin/colors`, colorData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create color");
        }
    }
);

export const updateColor = createAsyncThunk(
    "colors/updateColor",
    async ({ id, colorData }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            };
            const response = await axios.put(`${API_URL}/api/admin/colors/${id}`, colorData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update color");
        }
    }
);

export const deleteColor = createAsyncThunk(
    "colors/deleteColor",
    async (id, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    ...getAuthHeader()
                }
            };
            await axios.delete(`${API_URL}/api/admin/colors/${id}`, config);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete color");
        }
    }
);

// Slice
const colorSlice = createSlice({
    name: "colors",
    initialState: {
        colors: [],
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
            // Fetch colors
            .addCase(fetchColors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColors.fulfilled, (state, action) => {
                state.loading = false;
                state.colors = action.payload;
                state.error = null;
            })
            .addCase(fetchColors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create color
            .addCase(createColor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createColor.fulfilled, (state, action) => {
                state.loading = false;
                state.colors.push(action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(createColor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Update color
            .addCase(updateColor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateColor.fulfilled, (state, action) => {
                state.loading = false;
                state.colors = state.colors.map(color =>
                    color._id === action.payload._id ? action.payload : color
                );
                state.success = true;
                state.error = null;
            })
            .addCase(updateColor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Delete color
            .addCase(deleteColor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteColor.fulfilled, (state, action) => {
                state.loading = false;
                state.colors = state.colors.filter(color => color._id !== action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(deleteColor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { clearError, clearSuccess } = colorSlice.actions;
export default colorSlice.reducer; 