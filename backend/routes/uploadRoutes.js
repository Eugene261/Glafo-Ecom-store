const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { protect, admin } = require('../middleware/authMiddleware.js');

require("dotenv").config();

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
});

// Function to handle the stream upload to cloudinary
const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'products',
                resource_type: 'auto',
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        // Use streamifier to convert buffer to a stream
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please upload at least one image file" });
        }

        // Upload all images to cloudinary
        const uploadPromises = req.files.map(file => streamUpload(file.buffer));
        const results = await Promise.all(uploadPromises);

        // Extract URLs from results
        const urls = results.map(result => result.secure_url);

        // Respond with the uploaded image URLs
        res.json({
            success: true,
            urls: urls
        });
    } catch (error) {
        console.error('Image Upload Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload images"
        });
    }
});

module.exports = router;