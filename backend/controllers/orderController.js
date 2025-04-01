const Order = require("../models/order");




// @route GET /api/orders/my-orders
// @desc  Get logged in user's orders
// @access Private

const getOrders = async(req, res) => {
    try {
        //  Fetch orders for the authenticated user
        const orders = await Order.find({user: req.user._id}).sort({
            createdAt: -1,
        }); // Sort by most recent orders
        res.json(orders);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message : "Server Error"
        });
        
    }
};

// @route GET /api/orders/:id
// @desc Get order details by id
// @access Private
const getOrderById = async(req, res) => {
     try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email",
        );

        if(!order){
            return res.status(404).json({ message : "Order not found!"});
        }

        //  Return the full order details as response
        res.json(order);

     } catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message : "Server Error"
        });
     }
};


// @route POST /api/orders/:id
// @desc POST order details by id
// @access Private








module.exports = {
    getOrders,
    getOrderById
};