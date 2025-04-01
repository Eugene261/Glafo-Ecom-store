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
        <div className='flex flex-col lg:flex-row'>
            {/* Mobile filter */}
            <button
            onClick={toggleSidebar}
            className='lg:hidden border p-2 flex justify-center items-center'>
                <FaFilter  className='mr-2'/>  Filters
            </button>

            {/* Filter Sidebar */}
            <div
            ref={sidebarRef}
            className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 z-50 left-0 w-64
              bg-white overflow-y-auto transform duration-300 lg:static lg:translate-x-0 `}>
                <FilterSideBar collection={collection} />
            </div>
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