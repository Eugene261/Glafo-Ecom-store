const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware.js');
const productController = require('../controllers/productController.js');



const router = express.Router();

// Admin routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

// Public routes with rate limiting
router.get('/',  productController.getProducts);
router.get('/best-seller', productController.getBestSeller);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/similar/:id',  productController.getSimilarProducts);
router.get('/:id',  productController.getProduct);

module.exports = router;