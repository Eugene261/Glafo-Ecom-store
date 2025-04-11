const Product = require('../models/productModel.js');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Helper function to check if user is super admin
const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
};

// Helper function for consistent error responses
const handleError = (res, error, context = '') => {
  console.error(`${context} Error:`, error);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
  });
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

// @route POST /api/admin/products
// @desc Create a new product (admin only)
// @access Private/Admin
const CreateProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Input validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required fields'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Collections is already an array, no need to convert

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured: isFeatured || false,
      isPublished: isPublished !== undefined ? isPublished : true,
      tags,
      dimensions,
      weight,
      sku,
      createdBy: req.user._id, // Use createdBy instead of user field
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      product: createdProduct
    });

  } catch (error) {
    handleError(res, error, 'Create Product');
  }
});

// @route PUT /api/admin/products/:id
// @desc Update a product (admin only)
// @access Private/Admin
const UpdateProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has access to this product
    if (!isSuperAdmin(req.user) && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;
    if (collections) product.collections = collections;
    if (material) product.material = material;
    if (gender) product.gender = gender;
    if (images) product.images = images;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isPublished !== undefined) product.isPublished = isPublished;
    if (tags) product.tags = tags;
    if (dimensions) product.dimensions = dimensions;
    if (weight) product.weight = weight;
    if (sku) product.sku = sku;

    const updatedProduct = await product.save();

    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    handleError(res, error, 'Update Product');
  }
});

// @route DELETE /api/admin/products/:id
// @desc Delete a product (admin only)
// @access Private/Admin
const DeleteProduct = asyncHandler(async (req, res) => {
  try {
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has access to this product
    if (!isSuperAdmin(req.user) && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    handleError(res, error, 'Delete Product');
  }
});

module.exports = {
    GetProductsAdmin,
    CreateProduct,
    UpdateProduct,
    DeleteProduct
};