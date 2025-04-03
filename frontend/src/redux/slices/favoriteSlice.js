import { createSlice } from "@reduxjs/toolkit";

// Helper function to load favorites from local storage
const loadFavoritesFromStorage = () => {
    const storedFavorites = localStorage.getItem("favorites");
    return storedFavorites ? JSON.parse(storedFavorites) : [];
};

// Helper function to save favorites to localStorage
const saveFavoritesToStorage = (favorites) => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
};

const favoriteSlice = createSlice({
    name: "favorites",
    initialState: {
        favorites: loadFavoritesFromStorage(),
    },
    reducers: {
        toggleFavorite: (state, action) => {
            const product = action.payload;
            const index = state.favorites.findIndex(item => item._id === product._id);
            
            if (index === -1) {
                state.favorites.push(product);
            } else {
                state.favorites.splice(index, 1);
            }
            
            saveFavoritesToStorage(state.favorites);
        },
        clearFavorites: (state) => {
            state.favorites = [];
            localStorage.removeItem("favorites");
        }
    }
});

export const { toggleFavorite, clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer; 