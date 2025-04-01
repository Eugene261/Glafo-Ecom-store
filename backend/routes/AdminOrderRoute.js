const express = require("express");
const {protect, admin} = require('../middleware/authMiddleware.js');
const AdminOrderController = require("../controllers/AdminOrderController.js");




const router = express.Router();


router.get('/', protect, admin, AdminOrderController.getOrdersAdmin);
router.put('/:id', protect, admin, AdminOrderController.updateOrderStatusAdmin);
router.delete('/:id', protect, admin, AdminOrderController.deleteOrderAdmin);









module.exports = router;