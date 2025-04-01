const express = require('express');
const {protect} = require('../middleware/authMiddleware.js');
const orderController = require('../controllers/orderController.js');


const router = express.Router();


router.get('/my-orders', protect, orderController.getOrders );
router.get('/:id', protect, orderController.getOrderById );










module.exports = router;