const Product = require('../models/Product.js');
const mongoose = require('mongoose');

// Helper function for consistent error responses
const handleError = (res, error, context = '') => {
  console.error(`${context} Error:`, error);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
  });
};

// @route POST /api/products/create
// @desc Create a new Product
// @access Private | Admin
const createProduct = async (req, res) => {
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

    const collectionsString = collections?.join(', ') || '';

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
      collections: collectionsString,
      material,
      gender,
      images,
      isFeatured: isFeatured || false,
      isPublished: isPublished !== undefined ? isPublished : true,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      product: createdProduct
    });

  } catch (error) {
    handleError(res, error, 'Create Product');
  }
};

// @route PUT /api/products/update/:id
// @desc Update an existing product by ID
// @access Private | Admin
const updateProduct = async (req, res) => {
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
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!'
      });
    }

    // Update fields only if they are provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discoutPrice = discountPrice;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (sizes !== undefined) product.sizes = sizes;
    if (colors !== undefined) product.colors = colors;
    if (collections !== undefined) product.collections = collections.join(', ');
    if (material !== undefined) product.material = material;
    if (gender !== undefined) product.gender = gender;
    if (images !== undefined) product.images = images;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isPublished !== undefined) product.isPublished = isPublished;
    if (tags !== undefined) product.tags = tags;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (weight !== undefined) product.weight = weight;
    if (sku !== undefined) product.sku = sku;

    const updatedProduct = await product.save();
    res.json({
      success: true,
      product: updatedProduct
    });

  } catch (error) {
    handleError(res, error, 'Update Product');
  }
};

// @route DELETE /api/products/delete/:id
// @desc Delete an existing product by ID
// @access Private | Admin
const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!'
      });
    }

    await product.deleteOne();
    res.json({
      success: true,
      message: 'Product removed successfully'
    });

  } catch (error) {
    handleError(res, error, 'Delete Product');
  }
};

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
const getProducts = async (req, res) => {
  try {
    const {
      collection, 
      size, 
      color, 
      gender,
      minPrice, 
      maxPrice, 
      sortBy, 
      search,
      category, 
      material, 
      brand,
      limit = 100, // Set a reasonable default limit
      isRecommended // New parameter for recommended products
    } = req.query;

    // Base query with more lenient filtering
    let query = { isPublished: true }; // Always filter for published products

    // Handle recommended products differently
    if (isRecommended === 'true') {
      // For recommended products, we'll use a combination of factors
      return await getRecommendedProducts(req, res, limit);
    }

    // Collection filter
    if (collection && collection.toLowerCase() !== 'all') {
      query.collections = { $regex: collection, $options: 'i' };
    }

    // Category filter
    if (category && category.toLowerCase() !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }

    // Multi-value filters with case-insensitive partial matching
    const multiValueFilters = [
      { queryParam: 'material', dbField: 'material' },
      { queryParam: 'brand', dbField: 'brand' },
      { queryParam: 'size', dbField: 'sizes' }
    ];

    multiValueFilters.forEach(({ queryParam, dbField }) => {
      if (req.query[queryParam]) {
        const values = req.query[queryParam].split(',').map(v => v.trim());
        query[dbField] = { 
          $in: values.map(value => new RegExp(value, 'i')) 
        };
      }
    });

    // Color filter
    if (color) {
      const colors = color.split(',').map(c => c.trim());
      query.colors = { $in: colors };
    }

    // Gender filter
    if (gender && gender.toLowerCase() !== 'all') {
      query.gender = gender;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { salesCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .populate('user', 'name');

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in fetching products',
      error: error.message
    });
  }
};

// Helper function to get recommended products
const getRecommendedProducts = async (req, res, limit) => {
  try {
    // Find products that are:
    // 1. Published
    // 2. Have good ratings or sales
    // 3. Are in stock
    const recommendedProducts = await Product.find({
      isPublished: true,
      countInStock: { $gt: 0 }
    })
    .sort({ 
      salesCount: -1,  // First by sales
      rating: -1,      // Then by rating
      createdAt: -1    // Finally by newness
    })
    .limit(Number(limit))
    .select('name brand price images _id');

    if (!recommendedProducts.length) {
      return res.status(404).json({
        success: false,
        message: "No recommended products found"
      });
    }

    return res.json({
      success: true,
      products: recommendedProducts
    });
  } catch (error) {
    console.error('Get Recommended Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in fetching recommended products',
      error: error.message
    });
  }
};

// @route GET /api/products/best-seller
// @desc Retrieve the best selling product
// @access Public
const getBestSeller = async (req, res) => {
  try {
    // First, check if there are any published products at all
    const publishedProductsCount = await Product.countDocuments({ isPublished: true });
    
    if (publishedProductsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No published products found"
      });
    }

    // Strategy 1: Find product with highest sales count
    let bestSeller = await Product.findOne({
      isPublished: true,
      salesCount: { $gt: 0 }
    }).sort({ salesCount: -1, rating: -1 });

    // Strategy 2: If no products with sales, find highest-rated products
    if (!bestSeller) {
      bestSeller = await Product.findOne({
        isPublished: true,
        rating: { $gte: 4 }
      }).sort({ rating: -1, numReviews: -1 });
    }

    // Strategy 3: If still no product, find the most recently created published product
    if (!bestSeller) {
      bestSeller = await Product.findOne({
        isPublished: true
      }).sort({ createdAt: -1 });
    }

    // Strategy 4: If absolutely no products found, return the first published product
    if (!bestSeller) {
      bestSeller = await Product.findOne({ isPublished: true });
    }

    // Final check to ensure we have a product
    if (!bestSeller) {
      return res.status(404).json({
        success: false,
        message: "No products found"
      });
    }

    // Return the best seller
    res.json({
      success: true,
      product: bestSeller
    });

  } catch (error) {
    // Improved error handling
    console.error('Error in getBestSeller:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bestseller",
      error: error.message
    });
  }
};

// @route GET /api/products/new-arrivals
// @desc Retrieve latest products
// @access Public
const getNewArrivals = async (req, res) => {
  try {
    const newArrivals = await Product.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name brand price images _id'); // Select only needed fields

    if (!newArrivals.length) {
      return res.status(404).json({
        success: false,
        message: "No new arrivals found"
      });
    }

    // Add createdAt to check if products are being sorted correctly
    console.log('New Arrivals:', newArrivals.map(p => ({ 
      name: p.name, 
      createdAt: p.createdAt 
    })));

    res.json({
      success: true,
      count: newArrivals.length,
      products: newArrivals
    });

  } catch (error) {
    console.error('Get New Arrivals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in fetching new arrivals',
      error: error.message
    });
  }
};

// @route GET /api/products/:id
// @desc Get a single product
// @access Public
const getProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!"
      });
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    handleError(res, error, 'Get Product');
  }
};

// @route GET /api/products/similar/:id
// @desc Retrieve similar products
// @access Public
const getSimilarProducts = async (req, res) => {
  try {
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Find the base product
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Create a flexible query to find similar products
    const query = {
      _id: { $ne: req.params.id }, // Exclude current product
    };

    // Construct similarity criteria with fallback mechanism
    const similarityCriteria = [
      // Try exact match on multiple fields
      {
        $and: [
          { gender: product.gender },
          { category: product.category }
        ]
      },
      // Fallback to broader category match
      { category: product.category },
      // Further fallback to just gender
      { gender: product.gender }
    ];

    // Use $or to try multiple similarity criteria
    query.$or = similarityCriteria;

    // Fetch similar products with progressive fallback
    const similarProducts = await Product.find(query)
      .limit(10)  // Increased limit to ensure results
      .sort({ createdAt: -1 });  // Sort by newest if no specific sorting

    // If no products found, fetch some random products
    if (similarProducts.length === 0) {
      const randomProducts = await Product.find({
        _id: { $ne: req.params.id }
      })
      .limit(10)
      .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: randomProducts.length,
        products: randomProducts,
        message: 'No exact matches found. Showing random products.'
      });
    }

    res.json({
      success: true,
      count: similarProducts.length,
      products: similarProducts
    });

  } catch (error) {
    console.error('Get Similar Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in fetching similar products',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getSimilarProducts,
  getBestSeller,
  getNewArrivals
};