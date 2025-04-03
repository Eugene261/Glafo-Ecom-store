const Brand = require('../models/Brand');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    // Get brands from Brand model
    const savedBrands = await Brand.find({}).sort('name');
    const savedBrandNames = savedBrands.map(brand => brand.name);

    // Get unique brands from existing products
    const productBrands = await Product.distinct('brand');
    
    // Combine both sets of brands and remove duplicates
    // Filter out null/undefined values that might come from products without brands
    const allBrands = [...new Set([...savedBrandNames, ...productBrands])]
        .filter(brand => brand) // Remove null/undefined values
        .sort();
    
    res.json(allBrands);
});

// @desc    Create new brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
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
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
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
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
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