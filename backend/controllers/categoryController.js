const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    // Get categories from Category model
    const savedCategories = await Category.find({}).sort('name');
    const savedCategoryNames = savedCategories.map(cat => cat.name);

    // Get unique categories from existing products
    const productCategories = await Product.distinct('category');
    
    // Combine both sets of categories and remove duplicates
    const allCategories = [...new Set([...savedCategoryNames, ...productCategories])].sort();
    
    res.json(allCategories);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        res.status(400);
        throw new Error('Please provide a category name');
    }

    const categoryExists = await Category.findOne({ name: name.trim() });
    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category.name);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    if (!name) {
        res.status(400);
        throw new Error('Please provide a category name');
    }

    const categoryExists = await Category.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
    });
    
    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    category.name = name.trim();
    await category.save();
    res.json(category.name);
});

module.exports = {
    getCategories,
    createCategory,
    deleteCategory,
    updateCategory
}; 