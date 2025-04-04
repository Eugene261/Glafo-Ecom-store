require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js')
const userRoutes = require('./routes/userRoutes.js');
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
  'https://glafo-frontend.vercel.app', // Replace with your actual Vercel frontend domain
  'https://rabbit-frontend.vercel.app',
  'https://glafo.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('CORS blocked request from:', origin);
      // You can either block the request or allow it
      return callback(null, true); // Temporarily allow all origins in production
    }
    return callback(null, true);
  },
  credentials: true
}));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

app.get('/', (req, res) =>{
    res.send('Welcome to Glafo')
});

// API Routes
app.use('/api/users', userRoutes);
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

app.listen(PORT, () =>{
    console.log(`Server is running on port http://localhost:${PORT}`)
});