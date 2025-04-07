const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for the product'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    images: [{
        type: String,
        required: [true, 'Please provide at least one image']
    }],
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['T-Shirts', 'Shirts', 'Polo', 'Sweatshirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts', 'Jeans', 'Sweatpants', 'Sneakers', 'Running', 'Casual', 'Flats', 'Heels', 'Blouses', 'Tops', 'Skirts', 'Leggings']
    },
    gender: {
        type: String,
        required: [true, 'Please specify gender'],
        enum: ['Men', 'Women']
    },
    sizes: [{
        type: String,
        required: [true, 'Please provide at least one size'],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }],
    colors: [{
        type: String,
        required: [true, 'Please provide at least one color']
    }],
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative']
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 