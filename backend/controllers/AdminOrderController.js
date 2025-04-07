const Order = require('../models/orderModel.js');
const Product = require('../models/productModel.js');
const asyncHandler = require('express-async-handler');

// Helper function to check if user is super admin
const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
};

// @route GET /api/admin/orders
// @desc Get all orders (Admin only)
// @access Private/Admin
const getOrdersAdmin = asyncHandler(async (req, res) => {
    let orders;
    
    if (isSuperAdmin(req.user)) {
        // Super admin can see all orders
        orders = await Order.find({})
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price images')
            .sort('-createdAt');
    } else {
        // Regular admin can only see orders containing their products
        const adminProducts = await Product.find({ createdBy: req.user._id }).select('_id');
        const productIds = adminProducts.map(p => p._id);
        
        orders = await Order.find({
            'orderItems.product': { $in: productIds }
        })
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price images')
            .sort('-createdAt');
    }
    
    res.json(orders);
});

// @route PUT /api/admin/orders/:id
// @desc Update order status (Admin only)
// @access Private/Admin
const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price images createdBy');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if admin has permission to update this order
    if (!isSuperAdmin(req.user)) {
        const hasPermission = order.orderItems.some(item => 
            item.product.createdBy.toString() === req.user._id.toString()
        );
        
        if (!hasPermission) {
            res.status(403);
            throw new Error('Not authorized to update this order');
        }
    }

    order.status = req.body.status || order.status;
    order.isDelivered = req.body.status === 'Delivered' ? true : order.isDelivered;
    order.deliveredAt = req.body.status === 'Delivered' ? Date.now() : order.deliveredAt;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @route DELETE /api/admin/orders/:id
// @desc Delete an order (Admin only)
// @access Private/Admin
const deleteOrderAdmin = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('orderItems.product', 'createdBy');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if admin has permission to delete this order
    if (!isSuperAdmin(req.user)) {
        const hasPermission = order.orderItems.some(item => 
            item.product.createdBy.toString() === req.user._id.toString()
        );
        
        if (!hasPermission) {
            res.status(403);
            throw new Error('Not authorized to delete this order');
        }
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
});

module.exports = {
    getOrdersAdmin,
    updateOrderStatusAdmin,
    deleteOrderAdmin
};