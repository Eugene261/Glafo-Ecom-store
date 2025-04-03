import { createSlice } from "@reduxjs/toolkit";

const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState: {
        isAuthenticated: false,
        loading: false,
        error: null
    },
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            localStorage.removeItem("userToken");
            localStorage.removeItem("userInfo");
        }
    }
});

export const { logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer; 