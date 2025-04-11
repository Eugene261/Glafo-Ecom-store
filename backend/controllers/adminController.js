const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Order = require('../models/orderModel.js');
const asyncHandler = require('express-async-handler');

// Helper function to check if user is super admin
const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
};

// @route GET /api/admin/users
// @desc Get all users (super admin only)
// @access Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
    // Check if user is super admin
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const users = await User.find({}).select('-password');
    res.json(users);
});

// @route GET /api/admin/user/:id
// @desc Get user by ID (super admin only)
// @access Private/SuperAdmin
const getUserById = asyncHandler(async (req, res) => {
    // Check if user is super admin
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @route PUT /api/admin/user/:id
// @desc Update user (super admin only)
// @access Private/SuperAdmin
const updateUser = asyncHandler(async (req, res) => {
    console.log('Update user request received:', {
        userId: req.params.id,
        requestBody: req.body,
        requestingUser: req.user ? { id: req.user._id, role: req.user.role } : 'No user in request'
    });

    // Check if user is super admin
    if (!isSuperAdmin(req.user)) {
        console.log('Access denied: User is not a super admin');
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    try {
        const user = await User.findById(req.params.id);
        console.log('User found:', user ? { id: user._id, role: user.role } : 'No user found');

        if (user) {
            const previousRole = user.role;
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            
            if (req.body.password) {
                user.password = req.body.password;
            }

            console.log(`Updating user role from ${previousRole} to ${user.role}`);
            const updatedUser = await user.save();
            console.log('User updated successfully:', { id: updatedUser._id, role: updatedUser.role });

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            console.log('User not found with ID:', req.params.id);
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error in updateUser:', error.message);
        res.status(500);
        throw new Error(`Failed to update user: ${error.message}`);
    }
});

// @route DELETE /api/admin/user/:id
// @desc Delete user (super admin only)
// @access Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
    // Check if user is super admin
    if (!isSuperAdmin(req.user)) {
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @route GET /api/admin/stats
// @desc Get admin dashboard stats
// @access Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    // For regular admins, only count their own products and related orders
    const query = isSuperAdmin(req.user) ? {} : { createdBy: req.user._id };
    
    const productCount = await Product.countDocuments(query);
    
    // For orders, we need to check if they contain products created by this admin
    let orderCount = 0;
    let totalSales = 0;
    
    if (isSuperAdmin(req.user)) {
        // Super admin can see all orders
        const orders = await Order.find({ isPaid: true });
        orderCount = orders.length;
        totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    } else {
        // Regular admin can only see orders containing their products
        const adminProducts = await Product.find({ createdBy: req.user._id }).select('_id');
        const productIds = adminProducts.map(p => p._id);
        
        const orders = await Order.find({
            isPaid: true,
            'orderItems.product': { $in: productIds }
        });
        
        orderCount = orders.length;
        totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    }
    
    // User count is only available to super admin
    let userCount = 0;
    if (isSuperAdmin(req.user)) {
        userCount = await User.countDocuments({});
    }
    
    res.json({
        productCount,
        orderCount,
        totalSales,
        userCount: isSuperAdmin(req.user) ? userCount : null
    });
});

// @route POST /api/admin/users
// @desc Create a new user (super admin only)
// @access Private/SuperAdmin
const createUser = asyncHandler(async (req, res) => {
    console.log('Create user request received:', {
        requestBody: req.body,
        requestingUser: req.user ? { id: req.user._id, role: req.user.role } : 'No user in request'
    });

    // Check if user is super admin
    if (!isSuperAdmin(req.user)) {
        console.log('Access denied: User is not a super admin');
        res.status(403);
        throw new Error('Not authorized as super admin');
    }

    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email and password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create the user
    try {
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user' // Default to 'user' if no role specified
        });

        if (user) {
            console.log('User created successfully:', { id: user._id, role: user.role });
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        console.error('Error in createUser:', error.message);
        res.status(500);
        throw new Error(`Failed to create user: ${error.message}`);
    }
});

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAdminStats,
    createUser
};