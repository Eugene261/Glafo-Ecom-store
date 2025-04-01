import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';

const FilterSideBar = ({ collection }) => {
    const dispatch = useDispatch();
    const [searchParams, setUsearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: "",
        gender: "",
        color: "",
        size: [],
        material: [],
        brand: [],
        minPrice: 0,
        maxPrice: 100,
    });

    const [priceRange, setPriceRange] = useState([0, 100]);

    // categories
    const categories = ["Top Wear", "Bottom Wear"];

    // colors
    const colors = [
        "Red",
        "Orange",
        "Yellow",
        "Green",
        "Blue",
        "Purple",
        "Pink",
        "Brown",
        "Gray",
        "Black",
        "White",
        "Teal"
    ];

    // sizes
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

    // Materials
    const materials = [
        "Cotton",
        "Wool",
        "Silk",
        "Leather",
        "Denim",
        "Polyester",
        "Linen",
        "Velvet",
        "Suede",
        "Nylon",
        "Cashmere",
        "Spandex"
    ];

    // Brands
    const brands = [
        "Nike",
        "Adidas",
        "Gucci",
        "Louis Vuitton",
        "Zara",
        "H&M",
        "Puma",
        "Prada",
        "Versace",
        "Levi's",
        "Patagonia",
        "The North Face"
    ];

    // Genders
    const genders = ["Men", "Women"];

    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
        setFilters({
            category: params.category || "",
            gender: params.gender || "",
            color: params.color || "",
            size: params.size ? params.size.split(",") : [],
            material: params.material ? params.material.split(",") : [],
            brand: params.brand ? params.brand.split(",") : [],
            minPrice: params.minPrice || 0,
            maxPrice: params.maxPrice || 100,
        });
        setPriceRange([0, params.maxPrice || 100]);
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const { name, value, checked, type } = e.target;
        let newFilters = { ...filters };

        if (type === "checkbox") {
            if (checked) {
                newFilters[name] = [...(newFilters[name] || []), value];
            } else {
                newFilters[name] = newFilters[name].filter((item) => item !== value);
            }
        } else {
            newFilters[name] = value;
        }
        setFilters(newFilters);
        updateURLParams(newFilters);
        dispatch(fetchProductsByFilters({
            ...newFilters,
            collection,
            isPublished: true
        }));
    };

    const updateURLParams = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach((key) => {
            if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
                params.append(key, newFilters[key].join(","));
            } else if (newFilters[key]) {
                params.append(key, newFilters[key]);
            }
        });
        setUsearchParams(params);
        navigate(`?${params.toString()}`);
    };

    const handlePriceChange = (e) => {
        const newPrice = e.target.value;
        setPriceRange([0, newPrice]);
        const newFilters = { ...filters, maxPrice: newPrice };
        setFilters(newFilters);
        updateURLParams(newFilters);
        dispatch(fetchProductsByFilters({
            ...newFilters,
            collection,
            isPublished: true
        }));
    };

    return (
        <div className='p-4'>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>

            {/* Category Filter */}
            <div className="mb-6">
                <label className='block text-gray-600 font-medium mb-2'>Category</label>
                {categories.map((category) => (
                    <div key={category} className='flex items-center mb-1'>
                        <input
                            type="radio"
                            name='category'
                            value={category}
                            onChange={handleFilterChange}
                            checked={filters.category === category}
                            className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300'
                        />
                        <span className="text-gray-700">{category}</span>
                    </div>
                ))}
            </div>

            {/* Gender Filter */}
            <div className="mb-6">
                <label className='block text-gray-600 font-medium mb-2'>Gender</label>
                {genders.map((gender) => (
                    <div key={gender} className='flex items-center mb-1'>
                        <input
                            type="radio"
                            name='gender'
                            value={gender}
                            onChange={handleFilterChange}
                            checked={filters.gender === gender}
                            className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300'
                        />
                        <span className="text-gray-700">{gender}</span>
                    </div>
                ))}
            </div>

            {/* Color Filter */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <button
                            key={color}
                            name='color'
                            value={color}
                            onClick={handleFilterChange}
                            className={`w-8 h-8 rounded-full border border-gray-300
                            cursor-pointer transition hover:scale-105 ${filters.color === color ? "ring-2 ring-blue-500" : ""}`}
                            style={{ backgroundColor: color.toLowerCase() }}
                        />
                    ))}
                </div>
            </div>

            {/* Size Filter */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                        <label key={size} className="flex items-center">
                            <input
                                type="checkbox"
                                name="size"
                                value={size}
                                checked={filters.size.includes(size)}
                                onChange={handleFilterChange}
                                className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
                            />
                            <span className="text-gray-700">{size}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Material Filter */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Material</label>
                <div className="flex flex-wrap gap-2">
                    {materials.map((material) => (
                        <label key={material} className="flex items-center">
                            <input
                                type="checkbox"
                                name="material"
                                value={material}
                                checked={filters.material.includes(material)}
                                onChange={handleFilterChange}
                                className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
                            />
                            <span className="text-gray-700">{material}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Brand</label>
                <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                        <label key={brand} className="flex items-center">
                            <input
                                type="checkbox"
                                name="brand"
                                value={brand}
                                checked={filters.brand.includes(brand)}
                                onChange={handleFilterChange}
                                className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
                            />
                            <span className="text-gray-700">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Price Range</label>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>
        </div>
    );
};

export default FilterSideBar;