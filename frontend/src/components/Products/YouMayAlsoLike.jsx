import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import RenderImage from '../Common/RenderImage';
import QuickAddButton from './QuickAddButton';
import FavoriteButton from './FavoriteButton';

const YouMayAlsoLike = () => {
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const { 
    recommendedProducts: products, 
    recommendedLoading: loading, 
    recommendedError: error 
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductsByFilters({
      limit: 8,
      sortBy: 'popular',
      isPublished: true,
      isRecommended: true
    }));
  }, [dispatch]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">You May Also Like</h2>
            <p className="text-gray-600">Loading recommendations...</p>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-72 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">You May Also Like</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!products?.length) {
    return null;
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">You May Also Like</h2>
          <p className="text-gray-600">Discover more items that match your style</p>
        </div>
        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2.5 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide pb-4"
          >
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="flex-none w-72 group"
              >
                <div className="relative">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    <RenderImage
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                      enableZoom={true}
                    />
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <FavoriteButton product={product} />
                      <QuickAddButton product={product} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm text-gray-700 font-medium line-clamp-1 group-hover:text-black transition-colors">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${product.price?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2.5 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouMayAlsoLike; 