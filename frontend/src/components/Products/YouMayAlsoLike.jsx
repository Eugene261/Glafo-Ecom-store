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
    try {
      dispatch(fetchProductsByFilters({
        limit: 8,
        sortBy: 'popular',
        isPublished: true,
        isRecommended: true
      }));
    } catch (err) {
      console.error("Error dispatching recommended products:", err);
    }
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

  // Error state
  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold mb-8">You May Also Like</h2>
          <div className="text-center text-gray-500 py-8">
            <p>Unable to load recommended products at the moment.</p>
            <p className="text-sm mt-2">We're working on it and will be back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold mb-8">You May Also Like</h2>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (!products || products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold mb-8">You May Also Like</h2>
          <div className="text-center text-gray-500 py-8">
            <p>No recommended products available at the moment.</p>
            <p className="text-sm mt-2">Check back soon for our latest recommendations!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl text-center font-bold mb-8">You May Also Like</h2>
        
        <div className="relative">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          {/* Products Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={() => {}}
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
                      src={product.images[0]?.url}
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
                      <p className="text-sm font-medium text-gray-900">₵{product.price?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Scroll Right Button */}
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default YouMayAlsoLike; 