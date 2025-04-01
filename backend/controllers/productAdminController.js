const Product = require('../models/Product.js');



// @route GET /api/admin/products
// @desc Get all products (admin only)
// @access Private || Admin

const GetProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message : "Server Error"
        });
        
    }
};





module.exports = {
    GetProductsAdmin
};