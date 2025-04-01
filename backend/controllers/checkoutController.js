const Checkout = require('../models/checkout.js');
const Cart = require('../models/Cart.js');
const Product = require('../models/Product.js');
const order = require('../models/order.js');


// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
const createCheckout = async(req, res) => {
    const {checkoutItems, shippingAddress, paymentMethod, totalPrice} = req.body;

    // Validate checkout items
    if (!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({message: "No items in checkout"});
    }

    // Validate each item has quantity
    for (const item of checkoutItems) {
        if (!item.quantity || item.quantity < 1) {
            return res.status(400).json({
                message: `Invalid quantity for product ${item.productId}`
            });
        }
    }

    // Validate shipping address
    if (!shippingAddress || 
        !shippingAddress.address || 
        !shippingAddress.city || 
        !shippingAddress.postalCode || 
        !shippingAddress.country) {
        return res.status(400).json({
            message: "Complete shipping address is required"
        });
    }

    try {
        // Create a new checkout session
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems.map(item => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity  // Ensure quantity is included
            })),
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });

        return res.status(201).json(newCheckout);
        
    } catch (error) {
        console.error("Checkout error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            errorDetails: error.message
        });
    }
};

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after succesful payment
// @access Private

const updatePay = async(req, res) => {
    const {paymentStatus, paymentDetails} = req.body;
    try {
        const checkout = await Checkout.findById(req.params.id);

        // Correct the condition: return 404 if checkout is NOT found
        if(!checkout){
            return res.status(404).json({message : "Checkout not found!"})
        }

        if(paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            res.status(200).json(checkout)
        } else {
            res.status(400).json({message : "Invalid payment status"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Server Error"});
    }
};

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and correct to an order payment confirmation
// @access Private
const finalizeCheckout = async(req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        // Fixed: Properly check if checkout doesn't exist
        if(!checkout) {
            return res.status(404).json({ message: "No checkout found" });
        }

        if (!checkout.isPaid) {
            return res.status(400).json({ message: "Checkout is not paid" });
        }

        if (checkout.isFinalized) {
            return res.status(400).json({ message: "Checkout already finalized" });
        }

        // Create the final order based on the checkout details
        const finalOrder = await order.create({
            user: checkout.user,
            orderItems: checkout.checkoutItems,
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod,
            totalPrice: checkout.totalPrice,
            isPaid: true,
            paidAt: checkout.paidAt,
            isDelivered: false,
            paymentStatus: "paid",
            paymentDetails: checkout.paymentDetails,
        });

        // Mark Checkout as Finalized
        checkout.isFinalized = true;
        checkout.finalizedAt = Date.now();
        await checkout.save();

        // Delete the cart associated with the order
        await Cart.findOneAndDelete({ user: checkout.user });
        
        return res.status(201).json(finalOrder);

    } catch (error) {
        console.error("Finalize checkout error:", error);
        return res.status(500).json({ 
            message: "Server Error",
            error: error.message 
        });
    }
};





module.exports = {
    createCheckout,
    updatePay,
    finalizeCheckout
};