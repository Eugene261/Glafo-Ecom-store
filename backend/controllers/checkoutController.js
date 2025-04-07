const Checkout = require('../models/checkout.js');
const Cart = require('../models/Cart.js');
const Product = require('../models/productModel.js');
const Order = require('../models/orderModel.js');
const mongoose = require('mongoose');


// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
const createCheckout = async(req, res) => {
    const {checkoutItems, shippingAddress, paymentMethod, totalPrice} = req.body;

    try {
        // Validate checkout items
        if (!checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
            return res.status(400).json({message: "No items in checkout or invalid format"});
        }

        // Validate each item has all required fields
        for (const item of checkoutItems) {
            if (!item.productId || !item.quantity || !item.name || !item.price || !item.size || !item.color) {
                return res.status(400).json({
                    message: `Invalid item data. All items must have productId, quantity, name, price, size, and color`,
                    invalidItem: item
                });
            }

            if (item.quantity < 1) {
                return res.status(400).json({
                    message: `Invalid quantity for product ${item.name}`
                });
            }

            // Validate productId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(item.productId)) {
                return res.status(400).json({
                    message: `Invalid product ID format for ${item.name}`
                });
            }
        }

        // Validate shipping address
        if (!shippingAddress || 
            !shippingAddress.address || 
            !shippingAddress.city || 
            !shippingAddress.postalCode || 
            !shippingAddress.country ||
            !shippingAddress.additionalDetails ||
            !shippingAddress.additionalDetails.firstName ||
            !shippingAddress.additionalDetails.lastName ||
            !shippingAddress.additionalDetails.phone) {
            return res.status(400).json({
                message: "Complete shipping address with all details is required",
                receivedAddress: shippingAddress
            });
        }

        // Validate payment method and total price
        if (!paymentMethod) {
            return res.status(400).json({message: "Payment method is required"});
        }

        if (!totalPrice || totalPrice < 0) {
            return res.status(400).json({message: "Valid total price is required"});
        }

        // Create a new checkout session
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems.map(item => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            })),
            shippingAddress: {
                address: shippingAddress.address,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
                additionalDetails: shippingAddress.additionalDetails
            },
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
            errorDetails: error.message,
            receivedData: { checkoutItems, shippingAddress, paymentMethod, totalPrice }
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

        // Convert to lowercase for case-insensitive comparison
        const normalizedPaymentStatus = paymentStatus?.toLowerCase();
        
        if(normalizedPaymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = "paid"; // Always store as lowercase
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            res.status(200).json(checkout);
        } else {
            res.status(400).json({
                message: "Invalid payment status",
                details: `Received '${paymentStatus}', expected 'paid'`
            });
        }
    } catch (error) {
        console.error("Payment update error:", error);
        res.status(500).json({
            message: "Server Error",
            details: error.message
        });
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
        const finalOrder = await Order.create({
            user: checkout.user,
            orderItems: checkout.checkoutItems.map(item => ({
                product: item.productId,
                name: item.name,
                image: item.image,
                price: item.price,
                size: item.size,
                color: item.color,
                quantity: item.quantity
            })),
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod,
            totalPrice: checkout.totalPrice,
            isPaid: true,
            paidAt: checkout.paidAt,
            isDelivered: false,
            paymentStatus: "paid",
            paymentResult: checkout.paymentDetails,
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