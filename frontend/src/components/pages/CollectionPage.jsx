import React, { useEffect, useRef, useState } from 'react'
import { FaFilter } from 'react-icons/fa'
import FilterSideBar from '../Products/FilterSideBar';
import SortOption from '../Products/SortOption';
import ProductGrid from '../Products/ProductGrid';

const CollectionPage = () => {
    const [products, setProducts] = useState([]);

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
        setTimeout(() => {
            const fetchedProducts = [
                {
                    _id : 1,
                    name : "Product 1",
                    price : 110,
                    images : [{ url : "https://picsum.photos/500/500?random=1" }]
                },
                {
                    _id : 2,
                    name : "Product 2",
                    price : 220,
                    images : [{ url : "https://picsum.photos/500/500?random=2" }]
                },
                {
                    _id : 3,
                    name : "Product 3",
                    price : 330,
                    images : [{ url : "https://picsum.photos/500/500?random=3" }]
                },
                {
                    _id : 4,
                    name : "Product 4",
                    price : 440,
                    images : [{ url : "https://picsum.photos/500/500?random=4" }]
                },
                {
                  _id : 5,
                  name : "Product 5",
                  price : 550,
                  images : [{ url : "https://picsum.photos/500/500?random=5" }]
                },
                {
                _id : 6,
                name : "Product 6",
                price : 650,
                images : [{ url : "https://picsum.photos/500/500?random=6" }]
                },
                {
                _id : 7,
                name : "Product 7",
                price : 467,
                images : [{ url : "https://picsum.photos/500/500?random=7" }]
                },
                {
                _id : 8,
                name : "Product 8",
                price : 360,
                images : [{ url : "https://picsum.photos/500/500?random=8" }]
                },
            ];
            setProducts(fetchedProducts);
        }, 1000);
    }, []);

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

            <FilterSideBar  />
        </div>
        <div className="flex-grow p-4">
            <h2 className="text-2xl uppercase mb-4 "> All Collection</h2>


            {/* Sort Option */}
        <SortOption />

        {/* Product Grid */}
        <ProductGrid products={products} />
        </div>

        
    </div>
  )
}

export default CollectionPage