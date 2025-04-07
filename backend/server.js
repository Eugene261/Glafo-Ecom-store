require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js')
const userRoute = require('./routes/userRoute.js');
const productRoute = require('./routes/productRoutes.js');
const cartRoute = require('./routes/cartRoutes.js');
const checkoutRoute = require('./routes/checkoutRoutes.js');
const orderRoute = require('./routes/orderRoutes.js');
const uploadRoute = require('./routes/uploadRoutes.js');
const subscribeRoute = require('./routes/subscribeRoute.js');
const adminRoute = require('./routes/adminRoute.js');
const productAdminRoute = require('./routes/productAdminRoute.js');
const adminOrderRoute = require('./routes/AdminOrderRoute.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const brandRoutes = require('./routes/brandRoutes.js');

const app = express(); 

app.use(express.json());

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:5173',  // Local development frontend
  'https://glafo-frontend.vercel.app',
  'https://rabbit-frontend.vercel.app',
  'https://glafo.vercel.app',
  'https://glafo-ecom-store.vercel.app',
  'https://glafo-ecom-store-74h6.vercel.app'
];

// In production, allow all origins
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, etc)
    if (!origin) return callback(null, true);
    
    if (isProduction) {
      // In production, allow all origins for easier debugging
      console.log('Allowing request from origin:', origin);
      return callback(null, true);
    } else {
      // In development, check against allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        console.log('CORS blocked request from:', origin);
        return callback(null, false);
      }
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Basic health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Glafo API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/users', userRoute);
app.use('/api/products/', productRoute);
app.use('/api/cart/', cartRoute);
app.use('/api/checkout', checkoutRoute);
app.use('/api/orders', orderRoute);
app.use('/api/upload', uploadRoute);
app.use('/api', subscribeRoute);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);

// Admin
app.use('/api/admin', adminRoute);
app.use('/api/admin/products', productAdminRoute);
app.use('/api/admin/orders', adminOrderRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});