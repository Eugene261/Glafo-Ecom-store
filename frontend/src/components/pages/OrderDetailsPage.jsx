import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../redux/slices/orderSlice';
// Add console logging utility
const logOrderStructure = (order) => {
    if (!order) return;
    console.log('Order structure:', JSON.stringify(order, null, 2));
    if (order.orderItems && order.orderItems.length > 0) {
        console.log('First order item structure:', JSON.stringify(order.orderItems[0], null, 2));
        if (order.orderItems[0].product) {
            console.log('Product structure:', JSON.stringify(order.orderItems[0].product, null, 2));
        }
    }
};

const OrderDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedOrder: orderDetails, loading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchOrderById(id));
    }, [dispatch, id]);

    // Log order details structure when it's loaded
    useEffect(() => {
        if (orderDetails) {
            logOrderStructure(orderDetails);
        }
    }, [orderDetails]);

    if (loading) {
        return (
            <div className='max-w-7xl mx-auto p-4 sm:p-6'>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='max-w-7xl mx-auto p-4 sm:p-6'>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className='max-w-7xl mx-auto p-4 sm:p-6'>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
                <div className="text-gray-500">No order details found</div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto p-4 sm:p-6'>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
            <div className="p-4 sm:p-6 rounded-lg border">
                {/* order info */}
                <div className="flex flex-col sm:flex-row justify-between mb-8">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold">
                            Order ID: #{orderDetails._id}
                        </h3>
                        <p className="text-gray-600">
                            {new Date(orderDetails.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                        <span className={`${orderDetails.isPaid ? 
                            "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-700"
                        } px-3 py-1 rounded-full text-sm font-medium mb-2`}>
                            {orderDetails.isPaid ? "Approved" : "Pending"}
                        </span>

                        <span className={`${
                            orderDetails.isDelivered ? 
                            "bg-green-100 text-green-700" :
                            orderDetails.status === "Shipped" ? 
                            "bg-blue-100 text-blue-700" :
                            orderDetails.status === "Cancelled" ?
                            "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                        } px-3 py-1 rounded-full text-sm font-medium mb-2`}>
                            {orderDetails.isDelivered ? 
                                "Delivered" : 
                                orderDetails.status === "Shipped" ? 
                                "Shipped" : 
                                orderDetails.status === "Cancelled" ?
                                "Cancelled" :
                                "Processing"
                            }
                        </span>
                    </div>
                </div>

                {/* Customer Payment & Shipping info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                    {/* Payment Info */}
                    <div className="">
                        <h4 className="text-lg font-semibold mb-2">Payment Info</h4>
                        <p>Payment method: {orderDetails.paymentMethod}</p>
                        <p>Status: {orderDetails.isPaid ? "Paid" : "Unpaid"}</p>
                    </div>
                        
                    {/* Shipping Info */}
                    <div className="">
                        <h4 className="text-lg font-semibold mb-2">Shipping Info</h4>
                        <p>Shipping method: {orderDetails.shippingMethod}</p>
                        <p>
                            Address: {" "}
                            {`${orderDetails.shippingAddress?.city}, ${orderDetails.shippingAddress?.country}`}
                        </p>
                    </div>

                    {/* Order Status */}
                    <div className="">
                        <h4 className="text-lg font-semibold mb-2">Order Status</h4>
                        <p>Status: {orderDetails.status}</p>
                        {orderDetails.isDelivered && orderDetails.deliveredAt && (
                            <p>Delivered on: {new Date(orderDetails.deliveredAt).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>

                {/* Product list*/}
                <div className="overflow-x-auto">
                    <h4 className="text-lg font-semibold mb-4">Products</h4>
                    <table className='min-w-full text-gray-600 mb-4'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className="py-2 px-4">Name</th>
                                <th className="py-2 px-4">Unit Price</th>
                                <th className="py-2 px-4">Quantity</th>
                                <th className="py-2 px-4">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.orderItems?.map((item) => {
                                // Debug the item structure
                                console.log('Rendering item:', item);
                                
                                return (
                                <tr key={item._id || (item.product && item.product._id) || Math.random()} className='border-b'>
                                    <td className='py-2 px-4 flex items-center'>
                                        {item.product || item.image ? (
                                            <>
                                                <img
                                                    src={item.image || (item.product && item.product.images?.[0]) || '/placeholder.jpg'}
                                                    alt={item.name || (item.product && item.product.name) || 'Product'}
                                                    className='w-12 h-12 object-cover rounded-lg mr-4'
                                                />
                                                {item.product ? (
                                                    <Link to={`/product/${item.product._id}`}
                                                        className='text-blue-500 hover:underline'>
                                                        {item.product.name || item.name}
                                                    </Link>
                                                ) : (
                                                    <span>{item.name || 'Product'}</span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className='w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center'>
                                                    <span className='text-xs text-gray-500'>No image</span>
                                                </div>
                                                <span>{item.name || 'Product not available'}</span>
                                            </>
                                        )}
                                    </td>
                                    <td className="py-2 px-4">${item.price}</td>
                                    <td className="py-2 px-4">{item.quantity}</td>
                                    <td className="py-2 px-4">${item.price * item.quantity}</td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Back to Orders Link */}
                <Link to='/my-orders' className='text-blue-500 hover:underline'>
                    Back to my orders
                </Link>
            </div>
        </div>
    );
};

export default OrderDetailsPage;