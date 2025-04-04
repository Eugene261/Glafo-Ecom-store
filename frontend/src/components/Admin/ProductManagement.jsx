import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAdminProducts, createProduct, deleteProduct } from '../../redux/slices/adminProductSlice';
import { addBrand, updateBrand, deleteBrand, setBrands } from '../../redux/slices/brandSlice';
import { addCategory, updateCategory, deleteCategory, setCategories, fetchCategories } from '../../redux/slices/categorySlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { HiPencilAlt, HiTrash, HiPlus } from 'react-icons/hi';
import PageHeader from '../Common/PageHeader';
import usePageTitle from '../../hooks/usePageTitle';

const ProductManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, error: productsError } = useSelector((state) => state.adminProducts);
    const brands = useSelector((state) => state.brands.brands);
    const categories = useSelector((state) => state.categories.categories);
    const { user } = useSelector((state) => state.auth);
    const categoriesLoading = useSelector((state) => state.categories.loading);
    const brandsLoading = useSelector((state) => state.brands.loading);
    const categoriesError = useSelector((state) => state.categories.error);
    const brandsError = useSelector((state) => state.brands.error);

    // Set page title
    usePageTitle('Product Management');

    // State for new items
    const [newCategory, setNewCategory] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingBrand, setEditingBrand] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        countInStock: '',
        category: '',
        brand: '',
        gender: '',
        sizes: [],
        colors: [],
        collections: [],
        images: []
    });

    // Available options for select fields
    const genders = ['Men', 'Women', 'Unisex'];
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Gray'];
    const availableCollections = ['Summer', 'Winter', 'Spring', 'Autumn', 'Casual', 'Formal'];

    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        dispatch(fetchAdminProducts());
    }, [dispatch]);
    
    useEffect(() => {
        // Fetch categories and brands when component mounts
        dispatch(fetchCategories());
        dispatch(fetchBrands());
    }, [dispatch]);

    // Initialize categories and brands
    useEffect(() => {
        const initializeData = () => {
            // Initialize categories if empty
            const savedCategories = localStorage.getItem('categories');
            if (savedCategories) {
                dispatch(setCategories(JSON.parse(savedCategories)));
            } else if (!categories || categories.length === 0) {
                dispatch(setCategories(['Top Wear', 'Bottom Wear']));
            }
            
            // Initialize brands if empty
            const savedBrands = localStorage.getItem('brands');
            if (savedBrands) {
                dispatch(setBrands(JSON.parse(savedBrands)));
            } else if (!brands || brands.length === 0) {
                dispatch(setBrands(['Nike', 'Adidas', 'Puma']));
            }
        };

        initializeData();
    }, [dispatch]); // Remove categories and brands from dependencies

    // Save to localStorage whenever categories or brands change
    useEffect(() => {
        if (categories && categories.length > 0) {
            localStorage.setItem('categories', JSON.stringify(categories));
        }
    }, [categories]);

    useEffect(() => {
        if (brands && brands.length > 0) {
            localStorage.setItem('brands', JSON.stringify(brands));
        }
    }, [brands]);

    // Category Management Functions
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            dispatch(addCategory(newCategory.trim()));
            setNewCategory('');
        }
    };

    const handleDeleteCategory = (category) => {
        if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
            dispatch(deleteCategory(category));
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory({ original: category, edited: category });
    };

    const handleSaveCategory = () => {
        if (editingCategory.edited.trim() && !categories.includes(editingCategory.edited.trim())) {
            dispatch(updateCategory(editingCategory));
        }
        setEditingCategory(null);
    };

    // Brand Management Functions
    const handleAddBrand = (e) => {
        e.preventDefault();
        if (newBrand.trim() && !brands.includes(newBrand.trim())) {
            dispatch(addBrand(newBrand.trim()));
            setNewBrand('');
        }
    };

    const handleDeleteBrand = (brand) => {
        if (window.confirm(`Are you sure you want to delete the brand "${brand}"?`)) {
            dispatch(deleteBrand(brand));
        }
    };

    const handleEditBrand = (brand) => {
        setEditingBrand({ original: brand, edited: brand });
    };

    const handleSaveBrand = () => {
        if (editingBrand.edited.trim() && !brands.includes(editingBrand.edited.trim())) {
            dispatch(updateBrand(editingBrand));
        }
        setEditingBrand(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayInputChange = (e, field) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setNewProduct(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        
        // Show loading state 
        setError('');
        setIsUploading(true);
        
        try {
            console.log('Uploading images:', files.map(f => f.name));
            
            // Upload each file individually using the single endpoint
            const uploadPromises = files.map(file => {
                const formData = new FormData();
                formData.append('image', file);
                
                return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: formData
                }).then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(`Server error: ${response.status} ${response.statusText} - ${text}`);
                        });
                    }
                    return response.json();
                });
            });
            
            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);
            console.log('Upload responses:', results);
            
            // Process successful uploads
            const newImages = results
                .filter(data => data.success && data.imageUrl)
                .map(data => ({
                    url: data.imageUrl,
                    altText: 'Product Image'
                }));
            
            if (newImages.length > 0) {
                // Update product images with the new URLs
                setNewProduct(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages]
                }));
            } else {
                throw new Error('No images were successfully uploaded');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            setError(`Upload failed: ${error.message}`);
            
            // Fallback: Use local file preview if server upload failed
            if (error.message.includes('Server error') || error.message.includes('No images')) {
                // Create client-side image previews
                const localPreviews = files.map(file => ({
                    url: URL.createObjectURL(file),
                    altText: file.name,
                    isLocalPreview: true // Flag to identify local previews
                }));
                
                setNewProduct(prev => ({
                    ...prev,
                    images: [...prev.images, ...localPreviews]
                }));
                
                alert('Images are showing as previews only. Server upload failed, but you can continue with form submission. Images will be handled later.');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!newProduct.name || !newProduct.description || !newProduct.price || 
            !newProduct.category || !newProduct.brand || !newProduct.gender ||
            !newProduct.sizes.length || !newProduct.colors.length || 
            !newProduct.collections.length || !newProduct.images.length) {
            alert('Please fill in all required fields and add at least one image');
            return;
        }

        // Validate numeric fields
        if (isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
            alert('Please enter a valid price');
            return;
        }

        if (isNaN(Number(newProduct.countInStock)) || Number(newProduct.countInStock) < 0) {
            alert('Please enter a valid stock count');
            return;
        }

        try {
            const result = await dispatch(createProduct(newProduct)).unwrap();
            
            // Reset form
            setNewProduct({
                name: '',
                description: '',
                price: '',
                countInStock: '',
                category: '',
                brand: '',
                gender: '',
                sizes: [],
                colors: [],
                collections: [],
                images: []
            });

            // Refresh product list
            dispatch(fetchAdminProducts());
            alert('Product created successfully!');
        } catch (error) {
            console.error('Error creating product:', error);
            alert(error || 'Failed to create product. Please try again.');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(productId)).unwrap();
                dispatch(fetchAdminProducts());
                alert('Product deleted successfully!');
            } catch (error) {
                alert(error.message || 'Failed to delete product');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageHeader title="Product Management" />
            
            {/* Display any loading states or errors */}
            {(loading || categoriesLoading || brandsLoading) && (
                <p className="text-blue-500 mb-4">Loading data...</p>
            )}
            {(error || productsError || categoriesError || brandsError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error</p>
                    <p>{error || productsError || categoriesError || brandsError}</p>
                </div>
            )}

            {/* Categories Management */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Categories Management</h2>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        <HiPlus className="h-5 w-5" />
                    </button>
                </form>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div key={category} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            {editingCategory?.original === category ? (
                                <input
                                    type="text"
                                    value={editingCategory.edited}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, edited: e.target.value })}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            ) : (
                                <span>{category}</span>
                            )}
                            <div className="flex gap-2">
                                {editingCategory?.original === category ? (
                                    <button
                                        onClick={handleSaveCategory}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        <HiPencilAlt className="h-5 w-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteCategory(category)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <HiTrash className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Brands Management */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Brands Management</h2>
                <form onSubmit={handleAddBrand} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        placeholder="Enter new brand"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        <HiPlus className="h-5 w-5" />
                    </button>
                </form>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {brands.map((brand) => (
                        <div key={brand} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            {editingBrand?.original === brand ? (
                                <input
                                    type="text"
                                    value={editingBrand.edited}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, edited: e.target.value })}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            ) : (
                                <span>{brand}</span>
                            )}
                            <div className="flex gap-2">
                                {editingBrand?.original === brand ? (
                                    <button
                                        onClick={handleSaveBrand}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEditBrand(brand)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        <HiPencilAlt className="h-5 w-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteBrand(brand)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <HiTrash className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add New Product Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={newProduct.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={newProduct.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Category, Brand, and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                value={newProduct.category}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <select
                                name="brand"
                                value={newProduct.brand}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                name="gender"
                                value={newProduct.gender}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Gender</option>
                                {genders.map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stock Count */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Count</label>
                        <input
                            type="number"
                            name="countInStock"
                            value={newProduct.countInStock}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Sizes, Colors, and Collections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sizes</label>
                            <select
                                multiple
                                name="sizes"
                                value={newProduct.sizes}
                                onChange={(e) => handleArrayInputChange(e, 'sizes')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                {availableSizes.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Colors</label>
                            <select
                                multiple
                                name="colors"
                                value={newProduct.colors}
                                onChange={(e) => handleArrayInputChange(e, 'colors')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                {availableColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Collections</label>
                            <select
                                multiple
                                name="collections"
                                value={newProduct.collections}
                                onChange={(e) => handleArrayInputChange(e, 'collections')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                {availableCollections.map(collection => (
                                    <option key={collection} value={collection}>{collection}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="mt-1 block w-full"
                        />
                        {isUploading && (
                            <p className="text-sm text-blue-500 mt-1">Uploading images...</p>
                        )}
                        {newProduct.images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {newProduct.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`Preview ${index + 1}`}
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Product
                    </button>
                </form>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-xl font-semibold">Product List</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={product.images[0]?.url || '/placeholder.png'}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">₵{product.price}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.countInStock}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/admin/products/${product._id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <HiPencilAlt className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <HiTrash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;