import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../../redux/slices/orderSlice';

const MyOrderPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchUserOrders());
    }, [dispatch]);

    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    // Get status badge styling based on status
    const getStatusBadge = (isPaid, isDelivered, status) => {
        if (!isPaid) {
            return "bg-red-100 text-red-800";
        }
        if (isDelivered) {
            return "bg-green-100 text-green-800";
        }
        if (status === "Shipped") {
            return "bg-blue-100 text-blue-800";
        }
        if (status === "Cancelled") {
            return "bg-red-100 text-red-800";
        }
        return "bg-yellow-100 text-yellow-800";
    };

    // Get status text based on status
    const getStatusText = (isPaid, isDelivered, status) => {
        if (!isPaid) {
            return "Pending";
        }
        if (isDelivered) {
            return "Delivered";
        }
        if (status === "Shipped") {
            return "Shipped";
        }
        if (status === "Cancelled") {
            return "Cancelled";
        }
        return "Processing";
    };

    if (loading) {
        return (
            <div className='max-w-7xl mx-auto p-4 sm:p-6'>
                <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='max-w-7xl mx-auto p-4 sm:p-6'>
                <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto p-4 sm:p-6'>
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
                My Orders
            </h2>

            {/* Desktop view - Table */}
            <div className="hidden md:block relative shadow-md sm:rounded-lg overflow-hidden">
                <table className="min-w-full text-left text-gray-500">
                    <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                        <tr>
                            <th className='py-3 px-4'>Image</th>
                            <th className='py-3 px-4'>Order ID</th>
                            <th className='py-3 px-4'>Created</th>
                            <th className='py-3 px-4'>Shipping Address</th>
                            <th className='py-3 px-4'>Items</th>
                            <th className='py-3 px-4'>Price</th>
                            <th className='py-3 px-4'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <tr
                                    key={order._id}
                                    onClick={() => handleRowClick(order._id)}
                                    className='border-b hover:bg-gray-50 cursor-pointer'>
                                    {/* image */}
                                    <td className='py-4 px-4'>
                                        {order.orderItems && order.orderItems[0] ? (
                                            <img
                                                src={order.orderItems[0]?.image || order.orderItems[0]?.product?.images?.[0] || '/placeholder.jpg'}
                                                alt={order.orderItems[0]?.name || order.orderItems[0]?.product?.name || 'Product'}
                                                className='w-12 h-12 object-cover rounded-lg'
                                            />
                                        ) : (
                                            <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center'>
                                                <span className='text-xs text-gray-500'>No image</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className='py-4 px-4 font-medium text-gray-900 whitespace-nowrap'>
                                        #{order._id}
                                    </td>
                                    <td className='py-4 px-4'>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                        {" | "}
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className='py-4 px-4'>
                                        {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                    </td>

                                    <td className='py-4 px-4'>{order.orderItems?.length}</td>
                                    <td className='py-4 px-4'>${order.totalPrice}</td>
                                    <td className='py-4 px-4'>
                                        {/* Payment Status */}
                                        <span
                                            className={`${
                                                order.isPaid
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            } px-2 py-1 rounded-full text-xs font-medium mr-2`}>
                                            {order.isPaid ? "Paid" : "Pending"}
                                        </span>
                                        
                                        {/* Delivery Status */}
                                        {order.isPaid && (
                                            <span
                                                className={`${
                                                    getStatusBadge(order.isPaid, order.isDelivered, order.status)
                                                } px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block`}>
                                                {getStatusText(order.isPaid, order.isDelivered, order.status)}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                                    You have no orders
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
                {orders && orders.length > 0 ? (
                    orders.map((order) => (
                        <div 
                            key={order._id}
                            onClick={() => handleRowClick(order._id)}
                            className="bg-white rounded-lg shadow-md p-4 cursor-pointer border border-gray-200"
                        >
                            <div className="flex items-start mb-3">
                                {order.orderItems && order.orderItems[0] ? (
                                    <img
                                        src={order.orderItems[0]?.image || order.orderItems[0]?.product?.images?.[0] || '/placeholder.jpg'}
                                        alt={order.orderItems[0]?.name || order.orderItems[0]?.product?.name || 'Product'}
                                        className='w-16 h-16 object-cover rounded-lg mr-3'
                                    />
                                ) : (
                                    <div className='w-16 h-16 bg-gray-200 rounded-lg mr-3 flex items-center justify-center'>
                                        <span className='text-xs text-gray-500'>No image</span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-sm">Order #{order._id.slice(-8)}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div>
                                    <p className="text-xs text-gray-500">Items</p>
                                    <p className="font-medium">{order.orderItems?.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-medium">${order.totalPrice}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Shipping</p>
                                    <p className="font-medium truncate">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`${
                                        order.isPaid
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    } px-2 py-1 rounded-full text-xs font-medium`}>
                                    {order.isPaid ? "Paid" : "Pending"}
                                </span>
                                
                                {order.isPaid && (
                                    <span
                                        className={`${
                                            getStatusBadge(order.isPaid, order.isDelivered, order.status)
                                        } px-2 py-1 rounded-full text-xs font-medium`}>
                                        {getStatusText(order.isPaid, order.isDelivered, order.status)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        You have no orders
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrderPage;