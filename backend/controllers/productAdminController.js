const Product = require('../models/productModel.js');
const asyncHandler = require('express-async-handler');

// Helper function to check if user is super admin
const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
};

// @route GET /api/admin/products
// @desc Get all products (admin only)
// @access Private/Admin
const GetProductsAdmin = asyncHandler(async (req, res) => {
    // For regular admins, only show their own products
    const query = isSuperAdmin(req.user) ? {} : { createdBy: req.user._id };
    
    const products = await Product.find(query)
        .populate('createdBy', 'name email')
        .sort('-createdAt');
    
    res.json(products);
});

module.exports = {
    GetProductsAdmin
};