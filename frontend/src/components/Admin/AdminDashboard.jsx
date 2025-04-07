import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { isAdmin, isSuperAdmin } from '../../redux/slices/authSlice';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchOrders } from '../../redux/slices/orderSlice';
import { fetchUsers } from '../../redux/slices/userSlice';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const { products, loading: productsLoading } = useSelector((state) => state.products);
    const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
    const { users, loading: usersLoading } = useSelector((state) => state.users);

    useEffect(() => {
        if (!isAdmin(userInfo)) {
            navigate('/login');
        }
        dispatch(fetchProducts());
        dispatch(fetchOrders());
        if (isSuperAdmin(userInfo)) {
            dispatch(fetchUsers());
        }
    }, [dispatch, navigate, userInfo]);

    if (!isAdmin(userInfo)) {
        return null;
    }

    const getStats = () => {
        const stats = {
            totalProducts: products?.length || 0,
            totalOrders: orders?.length || 0,
            totalUsers: users?.length || 0,
            totalSales: orders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0,
        };

        return stats;
    };

    const stats = getStats();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">Total Products</h3>
                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                {isSuperAdmin(userInfo) && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </div>
                )}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">Total Sales</h3>
                    <p className="text-3xl font-bold">${stats.totalSales.toFixed(2)}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Link
                    to="/admin/products"
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
                    <p className="text-gray-600">Add, edit, or remove products</p>
                </Link>
                <Link
                    to="/admin/orders"
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-lg font-semibold mb-2">Manage Orders</h3>
                    <p className="text-gray-600">View and update order status</p>
                </Link>
                {isSuperAdmin(userInfo) && (
                    <Link
                        to="/admin/users"
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
                        <p className="text-gray-600">View and manage user accounts</p>
                    </Link>
                )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                {ordersLoading ? (
                    <p>Loading...</p>
                ) : orders?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Order ID</th>
                                    <th className="px-4 py-2">User</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Total</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order._id}>
                                        <td className="px-4 py-2">{order._id}</td>
                                        <td className="px-4 py-2">{order.user?.name}</td>
                                        <td className="px-4 py-2">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">${order.totalPrice}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    order.isPaid
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {order.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No orders found</p>
                )}
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
                {productsLoading ? (
                    <p>Loading...</p>
                ) : products?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2">Price</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.slice(0, 5).map((product) => (
                                    <tr key={product._id}>
                                        <td className="px-4 py-2">{product.name}</td>
                                        <td className="px-4 py-2">{product.category}</td>
                                        <td className="px-4 py-2">${product.price}</td>
                                        <td className="px-4 py-2">{product.stock}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    product.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {product.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No products found</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 