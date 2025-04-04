import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchNewArrivals } from '../../redux/slices/productSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import RenderImage from '../Common/RenderImage';
import QuickAddButton from './QuickAddButton';
import FavoriteButton from './FavoriteButton';
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Loading from "../Loading/Loading";

const NewArrivals = () => {
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);
  const containerRef = useRef(null);
  
  const { newArrivals, newArrivalsLoading: loading, newArrivalsError: error } = useSelector((state) => state.products);

  useEffect(() => {
    try {
      // Log the environment variables for debugging
      console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
      console.log('Attempting to fetch new arrivals...');
      
      dispatch(fetchNewArrivals())
        .unwrap()
        .then((result) => {
          console.log('New arrivals fetch success:', result);
        })
        .catch((error) => {
          console.error('New arrivals fetch error in component:', error);
        });
    } catch (error) {
      console.error("Error dispatching fetchNewArrivals:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    // Check if we need to show scroll buttons
    const checkScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    // Initial check
    checkScrollButtons();

    // Add event listener
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
    }

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
    };
  }, [newArrivals]); // Re-run when new arrivals change

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const position = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      
      setScrollPosition(position);
      setShowLeftBtn(position > 0);
      setShowRightBtn(position < maxScrollLeft - 10);
    };

    // Set initial button visibility
    handleScroll();
    
    // Add scroll event listener
    container.addEventListener("scroll", handleScroll);
    
    // Clean up
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [newArrivals]);

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

  // Error state
  if (error) {
    console.error('Rendering error state. Error details:', error);
    return (
      <div className="my-8 p-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">New Arrivals</h2>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          <p>Unable to load new arrivals at this time.</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="my-8 p-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">New Arrivals</h2>
        <Loading />
      </div>
    );
  }

  // No products state
  if (!newArrivals || newArrivals.length === 0) {
    return (
      <div className="my-8 p-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">New Arrivals</h2>
        <p className="text-gray-600">No new arrivals available. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="my-8 relative">
      <h2 className="text-2xl font-semibold mb-4">New Arrivals</h2>

      <div className="relative group">
        {showLeftBtn && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scroll("left")}
          >
            <BsArrowLeft size={20} />
          </button>
        )}

        <div
          ref={containerRef}
          className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
        >
          {newArrivals.map((product) => (
            <div
              key={product._id}
              className="min-w-[250px] max-w-[250px] border rounded-lg overflow-hidden hover:shadow-lg transition duration-300"
            >
              <Link to={`/product/${product._id}`}>
                <div className="h-[200px] overflow-hidden">
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-gray-700 mt-1">${product.discount_price || product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {showRightBtn && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scroll("right")}
          >
            <BsArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;