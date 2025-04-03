import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch brands
export const fetchBrands = createAsyncThunk(
    'brands/fetchBrands',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/brands`, {
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
    brands: [],
    loading: false,
    error: null
};

const brandSlice = createSlice({
    name: 'brands',
    initialState,
    reducers: {
        addBrand: (state, action) => {
            state.brands.push(action.payload);
        },
        updateBrand: (state, action) => {
            const index = state.brands.findIndex(brand => brand === action.payload.original);
            if (index !== -1) {
                state.brands[index] = action.payload.edited;
            }
        },
        deleteBrand: (state, action) => {
            state.brands = state.brands.filter(brand => brand !== action.payload);
        },
        setBrands: (state, action) => {
            state.brands = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { addBrand, updateBrand, deleteBrand, setBrands } = brandSlice.actions;
export default brandSlice.reducer; 