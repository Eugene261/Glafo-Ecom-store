import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/Products/ProductGrid';
import usePageTitle from '../hooks/usePageTitle';

const Collections = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, loading } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories);
    const { brands } = useSelector((state) => state.brands);

    // Set page title
    usePageTitle('Collections');

    // Get current filter values from URL
    const currentCategory = searchParams.get('category') || '';
    const currentBrand = searchParams.get('brand') || '';
    const currentGender = searchParams.get('gender') || '';

    // Filter products based on selected filters
    const filteredProducts = products.filter(product => {
        const matchesCategory = !currentCategory || product.category === currentCategory;
        const matchesBrand = !currentBrand || product.brand === currentBrand;
        const matchesGender = !currentGender || product.gender === currentGender;
        return matchesCategory && matchesBrand && matchesGender;
    });

    // Handle filter changes
    const handleFilterChange = (type, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(type, value);
        } else {
            newParams.delete(type);
        }
        setSearchParams(newParams);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Filters */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleFilterChange('category', '')}
                                className={`block w-full text-left px-3 py-2 rounded ${!currentCategory ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleFilterChange('category', category)}
                                    className={`block w-full text-left px-3 py-2 rounded ${currentCategory === category ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Brands</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleFilterChange('brand', '')}
                                className={`block w-full text-left px-3 py-2 rounded ${!currentBrand ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                            >
                                All Brands
                            </button>
                            {brands.map(brand => (
                                <button
                                    key={brand}
                                    onClick={() => handleFilterChange('brand', brand)}
                                    className={`block w-full text-left px-3 py-2 rounded ${currentBrand === brand ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Gender</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleFilterChange('gender', '')}
                                className={`block w-full text-left px-3 py-2 rounded ${!currentGender ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                            >
                                All Genders
                            </button>
                            {['Men', 'Women', 'Unisex'].map(gender => (
                                <button
                                    key={gender}
                                    onClick={() => handleFilterChange('gender', gender)}
                                    className={`block w-full text-left px-3 py-2 rounded ${currentGender === gender ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="md:col-span-3">
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <ProductGrid products={filteredProducts} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Collections; 