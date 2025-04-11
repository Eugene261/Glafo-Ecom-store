const express = require("express");
const {protect, admin, superAdmin} = require('../middleware/authMiddleware.js');
const AdminOrderController = require("../controllers/AdminOrderController.js");

const router = express.Router();

// Create a middleware that allows both admin and superAdmin roles
const adminOrSuperAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(403);
        // Use next(error) pattern instead of throwing directly
        const error = new Error('Not authorized as admin or super admin');
        next(error);
    }
};

router.get('/', protect, adminOrSuperAdmin, AdminOrderController.getOrdersAdmin);
router.put('/:id', protect, adminOrSuperAdmin, AdminOrderController.updateOrderStatusAdmin);
router.delete('/:id', protect, adminOrSuperAdmin, AdminOrderController.deleteOrderAdmin);









module.exports = router;