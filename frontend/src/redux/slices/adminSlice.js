import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import { API_URL } from '../../config/config';

// Fetch all users (admin only)
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/users`,
            {
                headers : {
                    Authorization : `Bearer ${localStorage.getItem("userToken")}`
                },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
});

// Add the create user action
export const addUser = createAsyncThunk("admin/addUser", async (userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${API_URL}/api/admin/users`, 
            userData,
            {
                headers : {
                    'Content-Type': 'application/json',
                    Authorization : `Bearer ${localStorage.getItem("userToken")}`
                }
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
});

// Update user info
export const updateUser = createAsyncThunk("admin/updateUser", async ({id, userData}, {rejectWithValue}) =>{
    try {
        const response = await axios.put(`${API_URL}/api/admin/users/${id}`,
            userData,
            {
                headers : {
                    'Content-Type': 'application/json',
                    Authorization : `Bearer ${localStorage.getItem("userToken")}`
                }
            },
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
});

// Delete a user
export const deleteUser = createAsyncThunk("admin/deleteUser", async (id, {rejectWithValue}) => {
    try {
        await axios.delete(`${API_URL}/api/admin/users/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`
            }
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
});

const adminSlice = createSlice({
    name : "admin",
    initialState: {
        users: [],
        loading : false,
        error: null,
    },
    reducers : {},
    extraReducers: (builder) =>{
        builder
        .addCase(fetchUsers.pending, (state) => {
            state.loading = true
        })

        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })

        .addCase(updateUser.fulfilled, (state,action) => {
            const updatedUser = action.payload;
            const userIndex = state.users.findIndex((user) => user._id === updatedUser._id);
            if(userIndex !== -1){
                state.users[userIndex] = updatedUser;
            }
        })
        .addCase(deleteUser.fulfilled, (state, action) => {
            state.users = state.users.filter((user) => user._id !== action.payload);
        })
        .addCase(addUser.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(addUser.fulfilled, (state, action) => {
            state.loading = false;
            state.users.push(action.payload.user) // add a new user to the state
        })
        .addCase(addUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        })
    }
});

export default adminSlice.reducer
