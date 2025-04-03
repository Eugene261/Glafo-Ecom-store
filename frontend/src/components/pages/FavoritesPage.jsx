import React from 'react';
import { useSelector } from 'react-redux';
import ProductGrid from '../Products/ProductGrid';

const FavoritesPage = () => {
    const { favorites } = useSelector((state) => state.favorites);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
            {favorites.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No favorite items yet.</p>
                </div>
            ) : (
                <ProductGrid products={favorites} loading={false} error={null} />
            )}
        </div>
    );
};

export default FavoritesPage; 