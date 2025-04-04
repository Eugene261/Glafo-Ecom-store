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

// Log Cloudinary configuration
console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '[SET]' : '[NOT SET]',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '[SET]' : '[NOT SET]',
});

// Error handling middleware for multer
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        console.error('Multer error:', err);
        return res.status(400).json({
            success: false,
            message: `Multer upload error: ${err.message}`
        });
    } else if (err) {
        // An unknown error occurred
        console.error('Unknown upload error:', err);
        return res.status(500).json({
            success: false,
            message: `Unknown upload error: ${err.message}`
        });
    }
    // No errors, continue
    next();
};

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('Processing file:', file.originalname, 'mimetype:', file.mimetype);
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
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                }
            }
        );

        // Use streamifier to convert buffer to a stream
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Handle both single and multiple image uploads
router.post('/', protect, admin, (req, res, next) => {
    console.log('Upload request received. Headers:', JSON.stringify(req.headers));
    console.log('Content-Type:', req.headers['content-type']);
    next();
}, upload.array('images', 5), multerErrorHandler, async (req, res) => {
    try {
        console.log('Files received:', req.files ? req.files.length : 0);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Please upload at least one image file" 
            });
        }

        // Upload all images to cloudinary
        const uploadPromises = req.files.map(file => {
            console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes`);
            return streamUpload(file.buffer);
        });
        
        console.log('Starting uploads to Cloudinary...');
        const results = await Promise.all(uploadPromises);
        console.log('All uploads completed successfully');

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
            message: error.message || "Failed to upload images",
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

// Fallback for single image upload (for backward compatibility)
router.post('/single', protect, admin, upload.single('image'), multerErrorHandler, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: "Please upload an image file" 
            });
        }

        console.log(`Processing single file: ${req.file.originalname}, size: ${req.file.size} bytes`);
        const result = await streamUpload(req.file.buffer);

        res.json({
            success: true,
            imageUrl: result.secure_url
        });
    } catch (error) {
        console.error('Single Image Upload Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload image",
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

module.exports = router;