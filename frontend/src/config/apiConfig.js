// API configuration
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

// Helper function to get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: '/api/products',
  BEST_SELLER: '/api/products/best-seller',
  NEW_ARRIVALS: '/api/products/new-arrivals',
  SIMILAR_PRODUCTS: (id) => `/api/products/similar/${id}`,
  PRODUCT_DETAILS: (id) => `/api/products/${id}`,
  
  // Category endpoints
  CATEGORIES: '/api/categories',
  
  // Brand endpoints
  BRANDS: '/api/brands',
  
  // Cart endpoints
  CART: '/api/cart',
  MERGE_CART: '/api/cart/merge',
  
  // Checkout endpoints
  CHECKOUT: '/api/checkout',
  CHECKOUT_PAY: (id) => `/api/checkout/${id}/pay`,
  CHECKOUT_FINALIZE: (id) => `/api/checkout/${id}/finalize`,
  
  // Order endpoints
  ORDERS: '/api/orders',
  MY_ORDERS: '/api/orders/my-orders',
  ORDER_DETAILS: (id) => `/api/orders/${id}`,
  
  // User endpoints
  USERS: '/api/users',
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  
  // Admin endpoints
  ADMIN: '/api/admin',
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_SIZES: '/api/admin/sizes',
  ADMIN_COLORS: '/api/admin/colors',
  ADMIN_COLLECTIONS: '/api/admin/collections',
  
  // Upload endpoints
  UPLOAD: '/api/upload',
  UPLOAD_SINGLE: '/api/upload/single',
  
  // Size, color, collection endpoints
  SIZES: '/api/sizes',
  COLORS: '/api/colors',
  COLLECTIONS: '/api/collections'
};

// Export other API-related configurations here if needed
