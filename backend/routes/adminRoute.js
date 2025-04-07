const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser,
    getAdminStats
} = require('../controllers/adminController.js');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware.js');

// User management routes (super admin only)
router.get('/users', protect, superAdmin, getUsers);
router.get('/user/:id', protect, superAdmin, getUserById);
router.put('/user/:id', protect, superAdmin, updateUser);
router.delete('/user/:id', protect, superAdmin, deleteUser);

// Admin dashboard stats (all admins)
router.get('/stats', protect, admin, getAdminStats);

module.exports = router;