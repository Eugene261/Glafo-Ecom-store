import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to load cart from local storage
const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : {products : [] };
};

// Helper function to save the cart to localStorage
const saveCartToStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
};

// Helper function for retry logic
const retryRequest = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
};

// Fetch Cart for user or guest
export const fetchCart = createAsyncThunk(
    "cart/fetchCart", 
    async ({userId, guestId}, {rejectWithValue}) => {
        try {
            const response = await retryRequest(async () => {
                return await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
                    {
                        params: {userId, guestId},
                        timeout: 8000
                    }
                );
            });
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue("Request timed out. Please try again.");
            }
            if (!error.response) {
                return rejectWithValue("Network error. Please check your connection.");
            }
            return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
        }
    }
);

// Add an item to the cart for a user or guest
export const addToCart = createAsyncThunk(
    "cart/addToCart", 
    async ({productId, quantity, size, color, guestId, userId}, {rejectWithValue}) => {
        try {
            // Validate quantity
            if (!quantity || quantity < 1) {
                throw new Error("Quantity must be at least 1");
            }
            if (quantity > 99) {
                throw new Error("Maximum quantity allowed is 99");
            }

            const response = await retryRequest(async () => {
                return await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
                    {productId, quantity, size, color, guestId, userId},
                    {timeout: 8000}
                );
            });
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue("Request timed out. Please try again.");
            }
            if (!error.response) {
                return rejectWithValue("Network error. Please check your connection.");
            }
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to add to cart");
        }
    }
);

// Update the quantity of an item in the cart
export const updateCartItemQuantity = createAsyncThunk(
    "cart/updateCartItemQuantity", 
    async ({productId, quantity, guestId, userId, size, color}, {rejectWithValue}) => {
        try {
            // Validate quantity
            if (!quantity || quantity < 1) {
                throw new Error("Quantity must be at least 1");
            }
            if (quantity > 99) {
                throw new Error("Maximum quantity allowed is 99");
            }

            const response = await retryRequest(async () => {
                return await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
                    {productId, quantity, guestId, userId, size, color},
                    {timeout: 8000}
                );
            });
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue("Request timed out. Please try again.");
            }
            if (!error.response) {
                return rejectWithValue("Network error. Please check your connection.");
            }
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to update quantity");
        }
    }
);

// Remove an Item from the cart
export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart", 
    async ({productId, guestId, userId, size, color}, {rejectWithValue}) => {
        try {
            const response = await retryRequest(async () => {
                return await axios({
                    method: "DELETE",
                    url: `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
                    data: {productId, guestId, userId, size, color},
                    timeout: 8000
                });
            });
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue("Request timed out. Please try again.");
            }
            if (!error.response) {
                return rejectWithValue("Network error. Please check your connection.");
            }
            return rejectWithValue(error.response?.data?.message || "Failed to remove item");
        }
    }
);

// Merge guest cart into user cart
export const mergeCart = createAsyncThunk(
    "cart/mergeCart", 
    async ({guestId, user}, {rejectWithValue}) => {
        try {
            const token = localStorage.getItem("userToken");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await retryRequest(async () => {
                return await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
                    { guestId },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        timeout: 8000
                    }
                );
            });

            // Save the merged cart to local storage
            if (response.data) {
                saveCartToStorage(response.data);
            }

            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue("Request timed out. Please try again.");
            }
            if (error.response?.status === 401) {
                localStorage.removeItem("userToken");
                return rejectWithValue("Session expired. Please login again.");
            }
            if (!error.response) {
                return rejectWithValue("Network error. Please check your connection.");
            }
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to merge cart");
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cart: loadCartFromStorage(),
        loading: false,
        error: null,
        isCartOpen: false,
    },
    reducers: {
        clearCart: (state) => {
            state.cart = {products: []};
            localStorage.removeItem("cart");
        },
        clearError: (state) => {
            state.error = null;
        },
        setCartOpen: (state, action) => {
            state.isCartOpen = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add to cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.products) {
                    state.cart = action.payload;
                    saveCartToStorage(action.payload);
                } else {
                    // Fallback: manually update the quantity if payload is not properly structured
                    const { productId, size, color } = action.meta.arg;
                    const delta = action.meta.arg.quantity;
                    
                    state.cart.products = state.cart.products.map(item => {
                        if (item.productId === productId && 
                            item.size === size && 
                            item.color === color) {
                            return {
                                ...item,
                                quantity: item.quantity + delta
                            };
                        }
                        return item;
                    });
                    saveCartToStorage(state.cart);
                }
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update cart item quantity
            .addCase(updateCartItemQuantity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(updateCartItemQuantity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove from cart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                // Make sure the payload contains the updated cart
                if (action.payload && action.payload.products) {
                    state.cart = action.payload;
                    saveCartToStorage(action.payload);
                } else {
                    // Fallback: manually remove the item if payload is not properly structured
                    state.cart.products = state.cart.products.filter(item => 
                        !(item.productId === action.meta.arg.productId && 
                          item.size === action.meta.arg.size && 
                          item.color === action.meta.arg.color)
                    );
                    saveCartToStorage(state.cart);
                }
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Merge cart
            .addCase(mergeCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(mergeCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(mergeCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCart, clearError, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
