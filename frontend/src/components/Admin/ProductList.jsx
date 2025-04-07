import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { isSuperAdmin } from '../../redux/slices/authSlice';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';

const ProductList = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { products, loading, error } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success('Product deleted successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to delete product');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link
                    to="/admin/products/create"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                    Create Product
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Created By
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((product) => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {product._id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    ${product.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {product.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {product.createdBy?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/admin/products/${product._id}/edit`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </Link>
                                        {(isSuperAdmin(userInfo) || 
                                          product.createdBy?._id === userInfo._id) && (
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList; 