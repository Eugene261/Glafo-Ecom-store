const Order = require('../models/order.js');




// @route GET /api/admin/orders
// @desc Get all orders (Admin only)
// @access Private | Admin

const getOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Server Error"});
    }
};


// @route PUT /api/admin/orders/:id
// @desc Update order status(Admin only)
// @access Private | Admin
const updateOrderStatusAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            await order.save();
            res.json(order);
        } else {
            res.status(404).json({message : "Order not found."});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Server Error"}); 
    }
};

// @route DELETE /api/admin/orders/:id
// @desc Delete an order (Admin only)
// @access Private | Admin
const deleteOrderAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(order){
            await order.deleteOne();
            res.json({message : "Order removed"});
        } else {
            res.status(404).json({message : "Order not found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Server Error"});  
    }
};


module.exports = {
    getOrdersAdmin,
    updateOrderStatusAdmin,
    deleteOrderAdmin
};