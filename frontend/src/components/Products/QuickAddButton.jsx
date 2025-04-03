import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCartOpen } from '../../redux/slices/cartSlice';
import { toast } from 'sonner';
import { HiOutlineShoppingBag } from 'react-icons/hi2';

const QuickAddButton = ({ product }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const { user, guestId } = useSelector((state) => state.auth);

    const handleQuickAdd = async (e) => {
        e.preventDefault(); // Prevent navigation to product details
        e.stopPropagation(); // Prevent event bubbling

        try {
            setIsLoading(true);

            // For products with no variants, we can add directly
            // For products with variants, we'll use the first available option
            const cartItem = {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.url || '',
                quantity: 1,
                size: product.sizes?.[0] || '',
                color: product.colors?.[0] || '',
                guestId,
                userId: user?._id,
            };

            await dispatch(addToCart(cartItem)).unwrap();
            toast.success("Added to cart successfully!", {duration: 2000});
            dispatch(setCartOpen(true)); // Open the cart drawer
        } catch (err) {
            toast.error(err.message || "Failed to add to cart");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleQuickAdd}
            disabled={isLoading}
            className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-md
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     hover:scale-110 hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed
                     z-10"
            aria-label="Add to cart"
        >
            <HiOutlineShoppingBag className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
    );
};

export default QuickAddButton; 