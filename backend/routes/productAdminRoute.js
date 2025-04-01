const express = require("express");
const {protect, admin} = require('../middleware/authMiddleware.js');
const ProductAdminController = require("../controllers/productAdminController.js");




const router = express.Router();


router.get('/', protect, admin, ProductAdminController.GetProductsAdmin );









module.exports = router;