import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../../redux/slices/favoriteSlice';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';

const FavoriteButton = ({ product }) => {
    const dispatch = useDispatch();
    const { favorites } = useSelector((state) => state.favorites);
    const isFavorite = favorites.some(item => item._id === product._id);

    const handleToggleFavorite = (e) => {
        e.preventDefault(); // Prevent navigation to product details
        e.stopPropagation(); // Prevent event bubbling
        dispatch(toggleFavorite(product));
    };

    return (
        <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-16 bg-white rounded-full p-3 shadow-md
                     transition-all duration-200 hover:scale-110 hover:bg-gray-50
                     z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            {isFavorite ? (
                <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
                <HiOutlineHeart className="w-5 h-5" />
            )}
        </button>
    );
};

export default FavoriteButton; 