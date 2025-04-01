const express = require('express');
const {protect, admin} = require('../middleware/authMiddleware.js');
const checkoutController = require('../controllers/checkoutController.js');

const router = express.Router();


// Checkout Routes
router.post('/', protect, checkoutController.createCheckout);
router.put('/:id/pay', protect, checkoutController.updatePay);
router.post('/:id/finalize', protect, checkoutController.finalizeCheckout);











module.exports =    router;