const Brand = require('../models/Brand');
const Product = require('../models/productModel.js');
const asyncHandler = require('express-async-handler');

// Helper function to check if user is super admin
const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    // Get brands from Brand model
    const savedBrands = await Brand.find({}).sort('name');
    const savedBrandNames = savedBrands.map(brand => brand.name);

    // Get unique brands from existing products
    let productBrands;
    if (req.user && req.user.role === 'admin' && !isSuperAdmin(req.user)) {
        // Regular admin only sees brands from their products
        const adminProducts = await Product.find({ createdBy: req.user._id });
        productBrands = [...new Set(adminProducts.map(p => p.brand))];
    } else {
        // Public users and super admin see all brands
        productBrands = await Product.distinct('brand');
    }
    
    // Combine both sets of brands and remove duplicates
    // Filter out null/undefined values that might come from products without brands
    const allBrands = [...new Set([...savedBrandNames, ...productBrands])]
        .filter(brand => brand) // Remove null/undefined values
        .sort();
    
    res.json(allBrands);
});

// @desc    Create new brand
// @route   POST /api/brands
// @access  Private/SuperAdmin
const createBrand = asyncHandler(async (req, res) => {
    // Only super admin can create brands
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const { name } = req.body;
    
    if (!name) {
        res.status(400);
        throw new Error('Please provide a brand name');
    }

    const brandExists = await Brand.findOne({ name: name.trim() });
    if (brandExists) {
        res.status(400);
        throw new Error('Brand already exists');
    }

    const brand = await Brand.create({ name: name.trim() });
    res.status(201).json(brand.name);
});

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/SuperAdmin
const deleteBrand = asyncHandler(async (req, res) => {
    // Only super admin can delete brands
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
        res.status(404);
        throw new Error('Brand not found');
    }

    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
});

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/SuperAdmin
const updateBrand = asyncHandler(async (req, res) => {
    // Only super admin can update brands
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const { name } = req.body;
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
        res.status(404);
        throw new Error('Brand not found');
    }

    if (!name) {
        res.status(400);
        throw new Error('Please provide a brand name');
    }

    const brandExists = await Brand.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
    });
    
    if (brandExists) {
        res.status(400);
        throw new Error('Brand already exists');
    }

    brand.name = name.trim();
    await brand.save();
    res.json(brand.name);
});

module.exports = {
    getBrands,
    createBrand,
    deleteBrand,
    updateBrand
}; 