const express = require('express');
const {protect, admin} = require('../middleware/authMiddleware.js');
const cartController = require('../controllers/cartController.js');



const router = express.Router();



router.post('/', cartController.createCart);
router.put('/', cartController.updateCart);
router.delete('/', cartController.deleteCart);
router.get('/', cartController.getUserCart);
router.post('/merge', protect, cartController.mergeCart);









module.exports = router;