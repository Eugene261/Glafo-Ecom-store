const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// Helper function to check admin access to order
const checkAdminAccessToOrder = async (req, order) => {
    // Super admin has access to everything
    if (req.user.role === 'superAdmin') return true;
    
    // Regular admin can only access orders containing their products
    if (req.user.role === 'admin') {
        const productIds = order.orderItems.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        
        // Check if any product in the order was created by this admin
        return products.some(product => product.createdBy.toString() === req.user._id.toString());
    }
    
    return false;
};

// @route GET /api/orders/my-orders
// @desc  Get logged in user's orders
// @access Private

const getOrders = asyncHandler(async (req, res) => {
    let query = {};
    
    // If user is admin (not superAdmin), only show orders containing their products
    if (req.user.role === 'admin') {
        const products = await Product.find({ createdBy: req.user._id });
        const productIds = products.map(p => p._id);
        query = {
            'orderItems.product': { $in: productIds }
        };
    }
    
    const orders = await Order.find(query).populate('user', 'id name');
    res.json(orders);
});

// @route GET /api/orders/:id
// @desc Get order details by id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user is the order owner or has admin access
    if (order.user._id.toString() !== req.user._id.toString() && 
        !(await checkAdminAccessToOrder(req, order))) {
        res.status(401);
        throw new Error('Not authorized');
    }

    res.json(order);
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user is the order owner or has admin access
    if (order.user.toString() !== req.user._id.toString() && 
        !(await checkAdminAccessToOrder(req, order))) {
        res.status(401);
        throw new Error('Not authorized');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user has admin access to this order
    if (!(await checkAdminAccessToOrder(req, order))) {
        res.status(401);
        throw new Error('Not authorized');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
};