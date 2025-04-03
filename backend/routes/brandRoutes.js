const express = require('express');
const router = express.Router();
const {
    getBrands,
    createBrand,
    deleteBrand,
    updateBrand
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getBrands)
    .post(protect, admin, createBrand);

router.route('/:id')
    .delete(protect, admin, deleteBrand)
    .put(protect, admin, updateBrand);

module.exports = router; 