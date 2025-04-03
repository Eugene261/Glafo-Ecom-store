import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    fetchProductDetails as fetchAdminProductDetails, 
    updateProduct,
    clearSelectedProduct as clearAdminProduct,
    updateSelectedProduct as updateAdminProduct 
} from '../../redux/slices/adminProductSlice';
import { 
    fetchProductDetails as fetchPublicProductDetails,
    clearSelectedProduct as clearPublicProduct,
    updateSelectedProduct as updatePublicProduct 
} from '../../redux/slices/productSlice';
import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../Common/PageHeader';
import axios from 'axios';

const EditProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {id} = useParams();
    const {currentProduct, loading, error} = useSelector((state) => state.adminProducts);

    // Set the page title
    usePageTitle('Edit Product');

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        countInStock: 0,
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: []
    });

    const [uploadedImages, setUploadedImages] = useState(false);
    
    useEffect(() => {
        if(id){
            dispatch(fetchAdminProductDetails(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if(currentProduct){
            // Ensure collections is a string when setting from currentProduct
            const collections = Array.isArray(currentProduct.collections) 
                ? currentProduct.collections.join(', ')
                : currentProduct.collections || '';

            setProductData({
                ...currentProduct,
                collections
            });
        }
    }, [currentProduct]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        
        // Special handling for arrays and numbers
        if (name === 'sizes' || name === 'colors') {
            const arrayValue = value ? value.split(',').map(item => item.trim()) : [];
            setProductData(prevData => ({...prevData, [name]: arrayValue}));
        } else if (name === 'price' || name === 'countInStock') {
            setProductData(prevData => ({...prevData, [name]: value === '' ? '' : Number(value)}));
        } else {
            setProductData(prevData => ({...prevData, [name]: value}));
        }
    };

    const handleImageUpload = async(e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);
        
        try {    
            setUploadedImages(true);
            console.log('Uploading image...');
            const {data} = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`
                    }
                }
            );
            
            console.log('Upload response:', data);
            
            if (data.imageUrl) {
                const newImage = {
                    url: data.imageUrl,
                    altText: file.name || 'Product Image'
                };
                
                // Make sure we're not losing existing images
                setProductData((prevData) => {
                    const updatedImages = [...(prevData.images || []), newImage];
                    console.log('Updated images array:', updatedImages);
                    return {
                        ...prevData,
                        images: updatedImages
                    };
                });
                
                alert('Image uploaded successfully!');
            } else {
                throw new Error('No image URL received');
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(error.response?.data?.message || "Failed to upload image. Please try again.");
        } finally {
            setUploadedImages(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Log the current state before submission
            console.log('Current product data:', productData);
            
            // Prepare the data for submission
            const updatedData = {
                ...productData,
                price: Number(productData.price),
                countInStock: Number(productData.countInStock),
                // Ensure required arrays are properly formatted and not empty
                sizes: productData.sizes && Array.isArray(productData.sizes) 
                    ? productData.sizes.filter(size => size.trim() !== '')
                    : ['Default'],
                colors: productData.colors && Array.isArray(productData.colors)
                    ? productData.colors.filter(color => color.trim() !== '')
                    : ['Default'],
                // Convert collections to array and ensure it's not empty
                collections: productData.collections
                    ? typeof productData.collections === 'string'
                        ? productData.collections.split(',').map(c => c.trim()).filter(c => c !== '')
                        : productData.collections
                    : ['Default'],
                // Ensure gender is properly capitalized
                gender: productData.gender 
                    ? productData.gender.charAt(0).toUpperCase() + productData.gender.slice(1)
                    : 'Unisex',
                // Ensure images array is properly formatted and preserved
                images: Array.isArray(productData.images) && productData.images.length > 0
                    ? productData.images.map(img => ({
                        url: img.url,
                        altText: img.altText || 'Product Image'
                    }))
                    : [{ url: 'https://picsum.photos/400', altText: 'Default Product Image' }]
            };

            console.log('Submitting updated data with images:', updatedData.images);

            // Update the product
            const result = await dispatch(updateProduct({ id, productData: updatedData })).unwrap();
            console.log('Update result:', result);
            
            // Clear both product states
            dispatch(clearAdminProduct());
            dispatch(clearPublicProduct());
            
            // Force refresh the product details with a direct API call to ensure fresh data
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
            );
            
            const refreshedProduct = response.data.product;
            console.log('Directly fetched refreshed product:', refreshedProduct);
            
            // Update both states with the refreshed data
            dispatch(updateAdminProduct(refreshedProduct));
            dispatch(updatePublicProduct(refreshedProduct));
            
            // Show success message
            alert('Product updated successfully!');
            
            // Navigate to the product details page
            navigate(`/product/${id}`, { replace: true });
            
        } catch (error) {
            console.error('Failed to update product:', error);
            alert(error.response?.data?.message || 'Failed to update product. Please try again.');
        }
    };

    if(loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if(error) {
        return <div className="text-red-500 text-center py-4">Error: {error}</div>;
    }

    return (
        <div className='max-w-5xl mx-auto p-6 shadow-md rounded-md'>
            <PageHeader title="Edit Product" />
            <form onSubmit={handleSubmit} >
                {/* name */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Product Name</label>
                    <input
                        type="text"
                        name='name'
                        value={productData.name}
                        onChange={handleChange} 
                        className='w-full border border-r-gray-300 rounded-md p-2'
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Description</label>
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                        rows={4}
                        required
                    ></textarea>
                </div>

                {/* Price */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Price</label>
                    <input
                        type="number"
                        name='price'
                        value={productData.price}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                {/* Count In Stock */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Count In Stock</label>
                    <input
                        type="number"
                        name='countInStock'
                        value={productData.countInStock}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                        min="0"
                        required
                    />
                </div>

                {/* SKU */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>SKU</label>
                    <input
                        type="text"
                        name='sku'
                        value={productData.sku}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Category */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Category</label>
                    <input
                        type="text"
                        name='category'
                        value={productData.category}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Brand */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Brand</label>
                    <input
                        type="text"
                        name='brand'
                        value={productData.brand}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Collections */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Collections (comma-separated)</label>
                    <input
                        type="text"
                        name='collections'
                        value={productData.collections}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Sizes */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Sizes (comma-separated)</label>
                    <input
                        type="text"
                        name='sizes'
                        value={Array.isArray(productData.sizes) ? productData.sizes.join(", ") : ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Colors */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Colors (comma-separated)</label>
                    <input
                        type="text"
                        name='colors'
                        value={Array.isArray(productData.colors) ? productData.colors.join(", ") : ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Material */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Material</label>
                    <input
                        type="text"
                        name='material'
                        value={productData.material}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    />
                </div>

                {/* Gender */}
                <div className="mb-6">
                    <label className='block font-semibold mb-2'>Gender</label>
                    <select
                        name='gender'
                        value={productData.gender}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                    >
                        <option value="">Select Gender</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex</option>
                    </select>
                </div>

                {/* Image Upload Section */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Images</label>
                    <div className="flex flex-wrap gap-4 mb-4">
                        {productData.images && productData.images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img 
                                    src={image.url} 
                                    alt={image.altText || `Product image ${index + 1}`} 
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProductData(prev => ({
                                            ...prev,
                                            images: prev.images.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                             shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                                             hover:bg-red-600"
                                    title="Remove image"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-4 w-4" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                    >
                                        <path 
                                            fillRule="evenodd" 
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                                            clipRule="evenodd" 
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                    />
                    {uploadedImages && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
                </div>

                {/* Submit Button */}
                <button
                    type='submit'
                    className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors'
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Product'}
                </button>
            </form>
        </div>
    );
}

export default EditProductPage