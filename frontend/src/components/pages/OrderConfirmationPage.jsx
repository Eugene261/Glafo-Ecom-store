import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const order = location.state?.order;

    // If no order data is present, redirect to home
    React.useEffect(() => {
        if (!order) {
            navigate('/');
        }
    }, [order, navigate]);

    // If user is not logged in, redirect to login
    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const calculateEstimatedDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        orderDate.setDate(orderDate.getDate() + 5); // Add 5 days to the order date
        return orderDate.toLocaleDateString();
    };

    if (!order) {
        return null;
    }

    return (
        <div className='max-w-4xl mx-auto p-6 bg-white'>
            <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
                Thank You for Your Order!
            </h1>

            <div className="p-6 rounded-lg border">
                <div className="flex justify-between mb-20">
                    {/* Order ID & Date */}
                    <div className="">
                        <h2 className="text-xl font-semibold">
                            Order ID: {order._id}
                        </h2>
                        <p className="text-gray-500">
                            Order date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {/* Estimated Delivery */}
                    <div>
                        <p className="text-emerald-700 text-sm">
                            Estimated Delivery: {calculateEstimatedDelivery(order.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Ordered Items */}
                <div className="mb-20">
                    {order.orderItems.map((item) => (
                        <div
                            key={item.productId}
                            className="flex items-center mb-4"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className='w-16 h-1/6 object-cover rounded-md mr-4'
                            />

                            <div>
                                <h4 className="text-md font-semibold">{item.name}</h4>
                                <p className='text-sm text-gray-500'>
                                    {item.color} || {item.size}
                                </p>
                            </div>

                            <div className="ml-auto text-right">
                                <p className="text-md">${item.price}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment and Delivery Info */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Payment Info */}
                    <div className="">
                        <h4 className="text-lg font-semibold mb-2">Payment</h4>
                        <p className="text-gray-600">{order.paymentMethod}</p>
                        <p className="text-gray-600">Status: {order.paymentStatus}</p>
                    </div>

                    {/* Delivery Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Delivery</h4>
                        <p className='text-gray-600'>{order.shippingAddress.address}</p>
                        <p className="text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                        <p className="text-gray-600">{order.shippingAddress.country}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;