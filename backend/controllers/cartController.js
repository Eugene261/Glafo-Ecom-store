const Cart = require('../models/Cart.js');
const Product = require('../models/productModel.js');





// Helper function to geta cart by user Id or guest Id
const getCart = async(userId, guestId) =>{
    if(userId) {
        return await Cart.findOne({user: userId});
    } else if (guestId){
        return await Cart.findOne({ guestId });
    }
    return null;
};

// @rouet POST /api/cart
// @desc Add a product to the cart for a guest or logged in user
// @access Public
const createCart = async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found." });

        // Get the user's cart (or guest cart)
        let cart = await getCart(userId, guestId);

        if (cart) {
            // Check if the exact product variant (ID + size + color) exists in cart
            const existingProductIndex = cart.products.findIndex(
                (item) => 
                    item.productId.toString() === productId.toString() &&
                    item.size === size &&
                    item.color === color
            );

            if (existingProductIndex > -1) {
                // If exists, ADD the new quantity to the existing quantity
                cart.products[existingProductIndex].quantity += Number(quantity);
            } else {
                // If new variant, add as new item
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity: Number(quantity),
                });
            }

            // Recalculate total
            cart.totalPrice = cart.products.reduce(
                (total, item) => total + (item.price * item.quantity),
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            // Create new cart
            const newCart = await Cart.create({
                user: userId || undefined,
                guestId: guestId || "guest_" + new Date().getTime(),
                products: [{
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity: Number(quantity),
                }],
                totalPrice: product.price * quantity,
            });
            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error("Cart error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @rouet PUT /api/cart
// @desc Update a product quantity in the cart for a guest or logged in user
// @access Public
const updateCart = async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart not found!" });

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId.toString() && 
                   p.size === size && 
                   p.color === color
        );

        if (productIndex > -1) {
            // Update the product quantity
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity; // ACTUALLY UPDATE THE QUANTITY
            } else {
                cart.products.splice(productIndex, 1); // Remove if quantity is 0
            }

            // Recalculate and SAVE the total price
            cart.totalPrice = cart.products.reduce(
                (total, item) => total + (item.price * item.quantity),
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart!" });
        }

    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// @rouet DELETE /api/cart
// @desc Remove  product  in the cart 
// @access Public
const deleteCart = async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);
        
        // Check if cart exists first
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId.toString() && 
                   p.size === size && 
                   p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            // Recalculate total
            cart.totalPrice = cart.products.reduce(
                (total, item) => total + (item.price * item.quantity), 
                0
            );

            // Save only if there are items left, otherwise delete cart
            if (cart.products.length > 0) {
                await cart.save();
                return res.status(200).json(cart);
            } else {
                await Cart.findByIdAndDelete(cart._id);
                return res.status(200).json({ message: "Cart is now empty and has been deleted" });
            }
        } else {
            return res.status(404).json({ message: "Product not found in the cart" });
        }
    } catch (error) {
        console.error("Delete cart error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message 
        });
    }
};


// @route GET /api/cart
// @desc Get logged-in user's  or guest user's cart
// access Public

const getUserCart = async(req, res) => {
    const {userId, guestId} = req.query;
    try {
        const cart = await getCart(userId, guestId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({message : "Cart not found!"});
        }
    } catch (error) {
       console.error(error);
       res.status(500).send("Server Error");
        
    }
};

// @route POST /api/cart/merge
// @desc Merge guest cart into user on login
// @access Private
const mergeCart = async(req, res) => {
    const {guestId} = req.body;

    try {
        if (!guestId) {
            return res.status(400).json({ message: "Guest ID is required" });
        }

        // Find the guest cart and user cart
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });

        // If no guest cart exists, just return the user cart or empty response
        if (!guestCart) {
            return res.status(200).json(userCart || { products: [], totalPrice: 0 });
        }

        // If guest cart is empty, return user cart or empty response
        if (guestCart.products.length === 0) {
            return res.status(200).json(userCart || { products: [], totalPrice: 0 });
        }

        if (userCart) {
            // Merge guest cart with user cart
            guestCart.products.forEach((guestItem) => {
                const productIndex = userCart.products.findIndex((item) => 
                    item.productId.toString() === guestItem.productId.toString() && 
                    item.size === guestItem.size && 
                    item.color === guestItem.color
                );

                if (productIndex > -1) {
                    // If the item exists in the user cart, update the quantity
                    userCart.products[productIndex].quantity += guestItem.quantity;
                } else {
                    // Otherwise, add the guest item to the cart
                    userCart.products.push(guestItem);
                }
            });

            userCart.totalPrice = userCart.products.reduce(
                (total, item) => total + (item.price * item.quantity), 
                0
            );

            await userCart.save();
        } else {
            // If no user cart exists, create one with guest cart items
            const newUserCart = await Cart.create({
                user: req.user._id,
                products: guestCart.products,
                totalPrice: guestCart.totalPrice
            });
            
            // Remove the guest cart
            await Cart.findOneAndDelete({ guestId });
            
            return res.status(200).json(newUserCart);
        }

        // Remove the guest cart after successful merge
        await Cart.findOneAndDelete({ guestId });
        
        return res.status(200).json(userCart);
    } catch (error) {
        console.error("Cart merge error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Failed to merge carts",
            error: error.message 
        });
    }
};




module.exports = {
    createCart,
    updateCart,
    deleteCart,
    getUserCart,
    mergeCart

};
