import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch categories
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    categories: [],
    loading: false,
    error: null
};

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        addCategory: (state, action) => {
            state.categories.push(action.payload);
        },
        updateCategory: (state, action) => {
            const index = state.categories.findIndex(category => category === action.payload.original);
            if (index !== -1) {
                state.categories[index] = action.payload.edited;
            }
        },
        deleteCategory: (state, action) => {
            state.categories = state.categories.filter(category => category !== action.payload);
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { addCategory, updateCategory, deleteCategory, setCategories } = categorySlice.actions;
export default categorySlice.reducer; 