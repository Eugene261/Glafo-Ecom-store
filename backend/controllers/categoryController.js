const Category = require('../models/Category');
const Product = require('../models/productModel.js');
const asyncHandler = require('express-async-handler');

// Helper function to check if user is super admin
const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    // Get categories from Category model
    const savedCategories = await Category.find({}).sort('name');
    const savedCategoryNames = savedCategories.map(cat => cat.name);

    // Get unique categories from existing products
    let productCategories;
    if (req.user && req.user.role === 'admin' && !isSuperAdmin(req.user)) {
        // Regular admin only sees categories from their products
        const adminProducts = await Product.find({ createdBy: req.user._id });
        productCategories = [...new Set(adminProducts.map(p => p.category))];
    } else {
        // Public users and super admin see all categories
        productCategories = await Product.distinct('category');
    }
    
    // Combine both sets of categories and remove duplicates
    const allCategories = [...new Set([...savedCategoryNames, ...productCategories])].sort();
    
    res.json(allCategories);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/SuperAdmin
const createCategory = asyncHandler(async (req, res) => {
    // Only super admin can create categories
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

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
// @access  Private/SuperAdmin
const deleteCategory = asyncHandler(async (req, res) => {
    // Only super admin can delete categories
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

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
// @access  Private/SuperAdmin
const updateCategory = asyncHandler(async (req, res) => {
    // Only super admin can update categories
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

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