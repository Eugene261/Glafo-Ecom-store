const express = require('express');
const {protect} = require('../middleware/authMiddleware.js');
const orderController = require('../controllers/orderController.js');

const router = express.Router();

// Get admin revenue data
router.get('/admin-revenue', protect, orderController.getAdminRevenue);

// Get superAdmin revenue data with breakdown by admin
router.get('/super-admin-revenue', protect, orderController.getSuperAdminRevenue);

// Get user's orders
router.get('/my-orders', protect, orderController.getOrders);

// Create new order
router.post('/', protect, orderController.createOrder);

// Update order to paid
router.put('/:id/pay', protect, orderController.updateOrderToPaid);

// Update order to delivered
router.put('/:id/deliver', protect, orderController.updateOrderToDelivered);

// Get specific order by ID - This should be last since it uses a parameter that could match other routes
router.get('/:id', protect, orderController.getOrderById);

module.exports = router;