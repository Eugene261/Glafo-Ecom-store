import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';

const SortOption = ({ collection }) => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleSortChange = (e) => {
        const sortBy = e.target.value;
        searchParams.set("sortBy", sortBy);
        setSearchParams(searchParams);

        // Get all current filters from URL
        const currentFilters = Object.fromEntries([...searchParams]);
        
        // Dispatch the sort action with all current filters
        dispatch(fetchProductsByFilters({
            ...currentFilters,
            sortBy,
            collection,
            isPublished: true
        }));
    }

    return (
        <div className='mb-4 flex items-center justify-end'>
            <select
                id="sort"
                onChange={handleSortChange}
                value={searchParams.get("sortBy") || ""}
                className='border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
            </select>
        </div>
    )
}

export default SortOption