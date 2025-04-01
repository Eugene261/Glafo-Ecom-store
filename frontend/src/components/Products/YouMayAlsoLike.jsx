import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Reuse the RenderImage component
const RenderImage = ({ src, alt, className }) => {
  const [imgError, setImgError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  if (imgError || !src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <span className="text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          setImgError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

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
      const scrollAmount = 300; // Adjust this value to control scroll distance
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="mt-16 border-t pt-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-medium mb-8">You May Also Like</h2>
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
      <div className="mt-16 border-t pt-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-medium mb-8">You May Also Like</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!products?.length) {
    return null;
  }

  return (
    <div className="mt-16 border-t pt-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-medium mb-8">You May Also Like</h2>
        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
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
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm text-gray-700 group-hover:text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">${product.price?.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
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