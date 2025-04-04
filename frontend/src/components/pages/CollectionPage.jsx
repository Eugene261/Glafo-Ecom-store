import React, { useEffect, useRef, useState } from 'react'
import { FaFilter } from 'react-icons/fa'
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';
import FilterSideBar from '../Products/FilterSideBar';
import SortOption from '../Products/SortOption';
import ProductGrid from '../Products/ProductGrid';

const CollectionPage = () => {
    const { collection } = useParams();
    const [ searchParams ] = useSearchParams();
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const queryParams = Object.fromEntries([...searchParams]);

    const sidebarRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleClickOutside = (e) => {
        // Close sidebar if clicked outside
        if(sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setIsSidebarOpen(false);
        }
    };

    useEffect(() => {
        // Add Event Listener for clicks
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    useEffect(() => {
        // Fetch products based on collection
        dispatch(fetchProductsByFilters({
            collection,
            ...queryParams,
            isPublished: true
        }));
    }, [dispatch, collection, searchParams]);

    return (
        <div className='flex flex-col lg:flex-row min-h-screen'>
            {/* Mobile filter button */}
            <div className="sticky top-0 z-40 bg-white p-2 shadow-sm lg:hidden">
                <button
                    onClick={toggleSidebar}
                    className='w-full border border-gray-300 rounded p-2 flex justify-center items-center bg-white'>
                    <FaFilter className='mr-2'/> Filters
                </button>
            </div>

            {/* Filter Sidebar - Mobile */}
            <div
                ref={sidebarRef}
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                fixed inset-y-0 z-50 left-0 w-72 bg-white shadow-xl overflow-y-auto 
                transform transition-transform duration-300 ease-in-out lg:hidden`}>
                <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">Filters</h3>
                    <button onClick={toggleSidebar} className="text-gray-500">×</button>
                </div>
                <FilterSideBar collection={collection} />
            </div>

            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block lg:w-64 border-r flex-shrink-0 sticky top-0 h-screen overflow-hidden">
                <FilterSideBar collection={collection} />
            </div>

            {/* Main Content */}
            <div className="flex-grow p-4">
                <h2 className="text-2xl uppercase mb-4">{collection} Collection</h2>

                {/* Sort Option */}
                <SortOption collection={collection} />

                {/* Product Grid */}
                <ProductGrid products={products} loading={loading} error={error} />
            </div>
        </div>
    )
}

export default CollectionPage