import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchNewArrivals } from '../../redux/slices/productSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import RenderImage from '../Common/RenderImage';

const NewArrivals = () => {
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  const { newArrivals, newArrivalsLoading: loading, newArrivalsError: error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchNewArrivals());
  }, [dispatch]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-600">Discover our latest collection of trendy and fashionable clothing. Stay ahead of the curve with our newest styles.</p>
          </div>
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 w-48 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-600">Discover our latest collection of trendy and fashionable clothing. Stay ahead of the curve with our newest styles.</p>
          </div>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
          <p className="text-gray-600">Discover our latest collection of trendy and fashionable clothing. Stay ahead of the curve with our newest styles.</p>
        </div>
        <div className="relative">
          {showLeftButton && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4
               bg-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-50"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide pb-4"
          >
            {newArrivals.map((product) => (
              <Link 
                key={product._id} 
                to={`/product/${product._id}`}
                className="flex-none w-72 group cursor-pointer"
              >
                <div className="relative">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    <RenderImage
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                      enableZoom={true}
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm text-gray-700 group-hover:text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">${product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {showRightButton && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white
               p-2 rounded-full shadow-lg z-10 hover:bg-gray-50"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;