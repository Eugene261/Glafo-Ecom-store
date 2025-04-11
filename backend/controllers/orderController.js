const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// Helper function to check admin access to order
const checkAdminAccessToOrder = async (req, order) => {
    try {
        // Check if user exists and has role
        if (!req.user || !req.user.role) return false;

        // Super admin has access to everything
        if (req.user.role === 'superAdmin') return true;
        
        // Regular admin can only access orders containing their products
        if (req.user.role === 'admin' && order && order.orderItems) {
            // Extract valid product IDs
            const productIds = order.orderItems
                .filter(item => item && item.product)
                .map(item => item.product);
            
            if (productIds.length === 0) return false;
            
            const products = await Product.find({ _id: { $in: productIds } });
            
            // Check if any product in the order was created by this admin
            return products.some(product => 
                product && product.createdBy && 
                product.createdBy.toString() === req.user._id.toString()
            );
        }
        
        return false;
    } catch (error) {
        console.error('Error in checkAdminAccessToOrder:', error);
        return false;
    }
};

// @route GET /api/orders/my-orders
// @desc  Get logged in user's orders
// @access Private

const getOrders = asyncHandler(async (req, res) => {
    try {
        console.log(`Fetching orders for user: ${req.user._id}, role: ${req.user.role}`);
        let query = {};
        
        // If regular user, only show their own orders
        if (req.user.role === 'user') {
            query = { user: req.user._id };
        }
        // If admin (not superAdmin), show orders containing their products
        else if (req.user.role === 'admin') {
            const products = await Product.find({ createdBy: req.user._id });
            const productIds = products.map(p => p._id);
            query = {
                'orderItems.product': { $in: productIds }
            };
        }
        // If superAdmin, they can see all orders (empty query)
        
        console.log('Order query:', JSON.stringify(query));
        const orders = await Order.find(query)
            .populate('user', 'id name')
            .populate('orderItems.product', 'name price images');
        console.log(`Found ${orders.length} orders`);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route GET /api/orders/:id
// @desc Get order details by id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
    try {
        console.log(`Fetching order details for ID: ${req.params.id}`);
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price images');

        if (!order) {
            console.log(`Order not found with ID: ${req.params.id}`);
            res.status(404);
            throw new Error('Order not found');
        }

        // Check if user is the order owner or has admin access
        if (req.user && order.user && 
            order.user._id.toString() !== req.user._id.toString() && 
            !(await checkAdminAccessToOrder(req, order))) {
            console.log('User not authorized to view this order');
            res.status(401);
            throw new Error('Not authorized');
        }

        console.log(`Successfully fetched order ${req.params.id}`);
        return res.json(order);
    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(error.statusCode || 500);
        return res.json({ message: error.message || 'An error occurred while fetching the order' });
    }
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

// @desc    Get admin revenue data
// @route   GET /api/orders/admin-revenue
// @access  Private/Admin
const getAdminRevenue = asyncHandler(async (req, res) => {
    try {
        // For regular admins, only show revenue from their products
        if (req.user.role === 'admin') {
            // Get all products created by this admin
            const products = await Product.find({ createdBy: req.user._id });
            const productIds = products.map(p => p._id);
            
            // Find all orders containing these products
            const orders = await Order.find({
                'orderItems.product': { $in: productIds },
                isPaid: true
            });
            
            // Calculate revenue by month for the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            // Initialize monthly revenue data
            const monthlyRevenue = {};
            for (let i = 0; i < 6; i++) {
                const month = new Date();
                month.setMonth(month.getMonth() - i);
                const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
                monthlyRevenue[monthKey] = 0;
            }
            
            // Calculate revenue from each order
            orders.forEach(order => {
                if (order.paidAt) {
                    const orderDate = new Date(order.paidAt);
                    const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
                    
                    if (monthlyRevenue[monthKey] !== undefined) {
                        // Only count revenue from this admin's products
                        let adminRevenue = 0;
                        order.orderItems.forEach(item => {
                            if (productIds.includes(item.product.toString())) {
                                adminRevenue += item.price * item.qty;
                            }
                        });
                        monthlyRevenue[monthKey] += adminRevenue;
                    }
                }
            });
            
            // Convert to array format for chart.js
            const revenueData = {
                labels: Object.keys(monthlyRevenue).map(key => {
                    const [year, month] = key.split('-');
                    return `${new Date(year, month-1).toLocaleString('default', { month: 'short' })} ${year}`;
                }).reverse(),
                values: Object.values(monthlyRevenue).reverse(),
                totalRevenue: Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0)
            };
            
            res.json(revenueData);
        } else {
            res.status(403);
            throw new Error('Not authorized as admin');
        }
    } catch (error) {
        console.error('Error fetching admin revenue:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get superAdmin revenue data with breakdown by admin
// @route   GET /api/orders/super-admin-revenue
// @access  Private/SuperAdmin
const getSuperAdminRevenue = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== 'superAdmin') {
            res.status(403);
            throw new Error('Not authorized as superAdmin');
        }
        
        // Get all paid orders
        const orders = await Order.find({ isPaid: true })
            .populate('orderItems.product', 'name price createdBy');
        
        // Get all admins
        const admins = await require('../models/userModel').find({ role: 'admin' });
        
        // Calculate revenue by month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        // Initialize data structure for total and per-admin revenue
        const revenueData = {
            totalRevenue: {
                labels: [],
                values: [],
                total: 0
            },
            adminRevenue: {}
        };
        
        // Initialize monthly revenue data
        const monthlyRevenue = {};
        const adminMonthlyRevenue = {};
        
        // Initialize data for each admin
        admins.forEach(admin => {
            adminMonthlyRevenue[admin._id] = {};
            revenueData.adminRevenue[admin._id] = {
                adminName: admin.name,
                adminEmail: admin.email,
                labels: [],
                values: [],
                total: 0
            };
        });
        
        // Initialize monthly data points
        for (let i = 0; i < 6; i++) {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
            monthlyRevenue[monthKey] = 0;
            
            // Initialize for each admin
            admins.forEach(admin => {
                adminMonthlyRevenue[admin._id][monthKey] = 0;
            });
        }
        
        // Calculate revenue from each order
        orders.forEach(order => {
            if (order.paidAt) {
                const orderDate = new Date(order.paidAt);
                const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
                
                if (monthlyRevenue[monthKey] !== undefined) {
                    // Process each order item
                    order.orderItems.forEach(item => {
                        if (item.product && item.product.createdBy) {
                            const adminId = item.product.createdBy.toString();
                            const itemRevenue = item.price * item.qty;
                            
                            // Add to total revenue
                            monthlyRevenue[monthKey] += itemRevenue;
                            
                            // Add to admin-specific revenue if it's an admin product
                            if (adminMonthlyRevenue[adminId] && adminMonthlyRevenue[adminId][monthKey] !== undefined) {
                                adminMonthlyRevenue[adminId][monthKey] += itemRevenue;
                            }
                        }
                    });
                }
            }
        });
        
        // Format total revenue data
        revenueData.totalRevenue.labels = Object.keys(monthlyRevenue).map(key => {
            const [year, month] = key.split('-');
            return `${new Date(year, month-1).toLocaleString('default', { month: 'short' })} ${year}`;
        }).reverse();
        revenueData.totalRevenue.values = Object.values(monthlyRevenue).reverse();
        revenueData.totalRevenue.total = Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0);
        
        // Format admin-specific revenue data
        admins.forEach(admin => {
            const adminId = admin._id.toString();
            if (adminMonthlyRevenue[adminId]) {
                revenueData.adminRevenue[adminId].labels = Object.keys(adminMonthlyRevenue[adminId]).map(key => {
                    const [year, month] = key.split('-');
                    return `${new Date(year, month-1).toLocaleString('default', { month: 'short' })} ${year}`;
                }).reverse();
                revenueData.adminRevenue[adminId].values = Object.values(adminMonthlyRevenue[adminId]).reverse();
                revenueData.adminRevenue[adminId].total = Object.values(adminMonthlyRevenue[adminId]).reduce((sum, val) => sum + val, 0);
            }
        });
        
        res.json(revenueData);
    } catch (error) {
        console.error('Error fetching superAdmin revenue:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getAdminRevenue,
    getSuperAdminRevenue
};