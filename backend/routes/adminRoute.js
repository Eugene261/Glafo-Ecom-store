const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser,
    getAdminStats,
    createUser
} = require('../controllers/adminController.js');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware.js');

// User management routes (super admin only)
router.get('/users', protect, superAdmin, getUsers);
router.post('/users', protect, superAdmin, createUser);
router.get('/users/:id', protect, superAdmin, getUserById);
router.put('/users/:id', protect, superAdmin, updateUser);
router.delete('/users/:id', protect, superAdmin, deleteUser);

// Admin dashboard stats (all admins)
router.get('/stats', protect, admin, getAdminStats);

module.exports = router;