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

// Simple CORS configuration that allows all origins
app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const PORT = process.env.PORT || 9000;

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

// Import and use the error middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});