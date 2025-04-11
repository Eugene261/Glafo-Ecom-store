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
    console.log('Update order status request:', {
        orderId: req.params.id,
        requestedStatus: req.body.status,
        requestingUser: req.user ? { id: req.user._id, role: req.user.role } : 'No user in request'
    });

    // Validate the status value
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(req.body.status)) {
        res.status(400);
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // First, get the order without populating to check if it exists
    const order = await Order.findById(req.params.id);

    if (!order) {
        console.log(`Order not found with ID: ${req.params.id}`);
        res.status(404);
        throw new Error('Order not found');
    }

    console.log(`Found order: ${order._id}, current status: ${order.status}`);

    // Now get the populated order for permission checking
    const populatedOrder = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price images createdBy');

    // Check if admin has permission to update this order
    if (!isSuperAdmin(req.user)) {
        console.log('User is not superAdmin, checking permissions...');
        const hasPermission = populatedOrder.orderItems.some(item => 
            item.product && item.product.createdBy && 
            item.product.createdBy.toString() === req.user._id.toString()
        );
        
        if (!hasPermission) {
            console.log('Permission denied: User is not authorized to update this order');
            res.status(403);
            throw new Error('Not authorized to update this order');
        }
        console.log('Permission granted: User is authorized to update this order');
    } else {
        console.log('SuperAdmin access: Permission automatically granted');
    }

    const previousStatus = order.status;
    
    // Use findByIdAndUpdate instead of save to avoid validation issues with populated fields
    const updateData = {
        status: req.body.status
    };
    
    // Update delivery status if needed
    if (req.body.status === 'Delivered') {
        updateData.isDelivered = true;
        updateData.deliveredAt = Date.now();
    }

    console.log(`Updating order status from ${previousStatus} to ${req.body.status}`);
    
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: false }
    );
    
    console.log('Order updated successfully');

    res.status(200).json(updatedOrder);
});

// @route DELETE /api/admin/orders/:id
// @desc Delete an order (Admin only)
// @access Private/Admin
const deleteOrderAdmin = asyncHandler(async (req, res) => {
    // First check if order exists
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Get populated order for permission checking
    const populatedOrder = await Order.findById(req.params.id)
        .populate('orderItems.product', 'createdBy');

    // Check if admin has permission to delete this order
    if (!isSuperAdmin(req.user)) {
        console.log('User is not superAdmin, checking delete permissions...');
        const hasPermission = populatedOrder.orderItems.some(item => 
            item.product && item.product.createdBy && 
            item.product.createdBy.toString() === req.user._id.toString()
        );
        
        if (!hasPermission) {
            console.log('Permission denied: User is not authorized to delete this order');
            res.status(403);
            throw new Error('Not authorized to delete this order');
        }
        console.log('Permission granted: User is authorized to delete this order');
    } else {
        console.log('SuperAdmin access: Delete permission automatically granted');
    }

    // Use findByIdAndDelete instead of deleteOne on the populated document
    await Order.findByIdAndDelete(req.params.id);
    console.log(`Order ${req.params.id} deleted successfully`);
    res.json({ message: 'Order removed' });
});

module.exports = {
    getOrdersAdmin,
    updateOrderStatusAdmin,
    deleteOrderAdmin
};