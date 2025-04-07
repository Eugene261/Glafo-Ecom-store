import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { isSuperAdmin } from '../../redux/slices/authSlice';
import { fetchOrders, updateOrderToDelivered } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';

const OrderList = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleDeliver = async (id) => {
        try {
            await dispatch(updateOrderToDelivered(id)).unwrap();
            toast.success('Order marked as delivered');
        } catch (error) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Orders</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Paid
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Delivered
                            </th>
                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {order._id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {order.user?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    ${order.totalPrice}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            order.isPaid
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {order.isPaid ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            order.isDelivered
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {order.isDelivered ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/admin/orders/${order._id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Details
                                        </Link>
                                        {!order.isDelivered && (
                                            <button
                                                onClick={() => handleDeliver(order._id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList; 