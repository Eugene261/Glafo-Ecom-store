import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { isAdmin } from "./authSlice";

// Helper function to get auth config
const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`
    }
});

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
    "adminAuth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
                credentials
            );

            const { user, token } = response.data;

            if (!isAdmin(user)) {
                throw new Error("User is not an admin");
            }

            localStorage.setItem("userToken", token);
            localStorage.setItem("userInfo", JSON.stringify(user));

            return user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Login failed"
            );
        }
    }
);

// Admin auth slice
const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState: {
        isAuthenticated: false,
        loading: false,
        error: null,
        user: null
    },
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            localStorage.removeItem("userToken");
            localStorage.removeItem("userInfo");
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(adminLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload;
            });
    }
});

export const { logout, clearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer; 