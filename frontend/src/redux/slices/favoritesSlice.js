import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    favorites: [],
    loading: false,
    error: null
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addToFavorites: (state, action) => {
            const item = action.payload;
            if (!state.favorites.some(favorite => favorite._id === item._id)) {
                state.favorites.push(item);
            }
        },
        removeFromFavorites: (state, action) => {
            state.favorites = state.favorites.filter(
                favorite => favorite._id !== action.payload._id
            );
        },
        clearFavorites: (state) => {
            state.favorites = [];
        }
    }
});

export const { addToFavorites, removeFromFavorites, clearFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer; 