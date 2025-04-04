import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSizes, createSize, deleteSize } from '../../redux/slices/sizeSlice';
import { HiTrash, HiPlus } from 'react-icons/hi';

const SizeManagement = () => {
    const dispatch = useDispatch();
    const { sizes = [], loading = false, error = null } = useSelector((state) => state.sizes || {});
    const [newSize, setNewSize] = useState('');

    useEffect(() => {
        dispatch(fetchSizes());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newSize.trim()) return;

        try {
            await dispatch(createSize(newSize)).unwrap();
            setNewSize('');
        } catch (err) {
            console.error('Failed to create size:', err);
        }
    };

    const handleDelete = async (sizeId) => {
        if (window.confirm('Are you sure you want to delete this size?')) {
            try {
                await dispatch(deleteSize(sizeId)).unwrap();
            } catch (err) {
                console.error('Failed to delete size:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Size Management</h1>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
                        <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            placeholder="Enter new size"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <HiPlus className="h-5 w-5" />
                            Add Size
                        </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sizes.map((size) => (
                            <div
                                key={size._id || size}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                                <span className="text-gray-900">{size.name || size}</span>
                                <button
                                    onClick={() => handleDelete(size._id || size)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                    <HiTrash className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SizeManagement; 