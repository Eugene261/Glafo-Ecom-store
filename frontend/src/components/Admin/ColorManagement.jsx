import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchColors, createColor, deleteColor } from '../../redux/slices/colorSlice';
import { HiTrash, HiPlus } from 'react-icons/hi';
import { SketchPicker } from 'react-color';

const ColorManagement = () => {
    const dispatch = useDispatch();
    const { colors = [], loading = false, error = null } = useSelector((state) => state.colors || {});
    const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        dispatch(fetchColors());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newColor.name.trim() || !newColor.hex) return;

        try {
            await dispatch(createColor({ name: newColor.name, hex: newColor.hex })).unwrap();
            setNewColor({ name: '', hex: '#000000' });
            setShowColorPicker(false);
        } catch (err) {
            console.error('Failed to create color:', err);
        }
    };

    const handleDelete = async (colorId) => {
        if (window.confirm('Are you sure you want to delete this color?')) {
            try {
                await dispatch(deleteColor(colorId)).unwrap();
            } catch (err) {
                console.error('Failed to delete color:', err);
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
                    <h1 className="text-2xl font-bold text-gray-900">Color Management</h1>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newColor.name}
                                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                placeholder="Enter color name"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                style={{ backgroundColor: newColor.hex }}
                            >
                                <span className="w-4 h-4 rounded-full border border-gray-300"></span>
                                Pick Color
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <HiPlus className="h-5 w-5" />
                                Add Color
                            </button>
                        </div>
                        {showColorPicker && (
                            <div className="absolute z-10">
                                <div
                                    className="fixed inset-0"
                                    onClick={() => setShowColorPicker(false)}
                                ></div>
                                <SketchPicker
                                    color={newColor.hex}
                                    onChange={(color) => setNewColor({ ...newColor, hex: color.hex })}
                                />
                            </div>
                        )}
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {colors.map((color) => (
                            <div
                                key={color._id || color}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-6 rounded-full border border-gray-300"
                                        style={{ backgroundColor: color.hex || color }}
                                    ></span>
                                    <span className="text-gray-900">{color.name || color}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(color._id || color)}
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

export default ColorManagement; 