const express = require("express");
const {protect, admin} = require('../middleware/authMiddleware.js');
const ProductAdminController = require("../controllers/productAdminController.js");

const router = express.Router();

// Get all products (filtered by admin role)
router.get('/', protect, admin, ProductAdminController.GetProductsAdmin);

// Create a new product
router.post('/', protect, admin, ProductAdminController.CreateProduct);

// Update product
router.put('/:id', protect, admin, ProductAdminController.UpdateProduct);

// Delete product
router.delete('/:id', protect, admin, ProductAdminController.DeleteProduct);

module.exports = router;