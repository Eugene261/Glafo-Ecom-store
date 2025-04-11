import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/adminOrderSlice';
import { toast } from 'sonner';

const OrderManagement = () => {
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {user} = useSelector((state) => state.auth);
    const {orders, loading, error} = useSelector((state) => state.adminOrders);
    
    useEffect(() => {
        if(!user || (user.role !== "admin" && user.role !== "superAdmin")){
            navigate("/login");
        } else {
            dispatch(fetchAllOrders());
        }
    }, [user, navigate, dispatch]);
    
    // If there's an error, show it as a toast
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingOrderId(orderId);
            console.log(`Attempting to update order ${orderId} to status ${status} from UI`);
            
            // Dispatch the action and wait for it to complete
            const result = await dispatch(updateOrderStatus({id: orderId, status})).unwrap();
            console.log('Order update result:', result);
            
            // Show success message
            toast.success(`Order status updated to ${status}`);
            
            // Refresh the orders list
            dispatch(fetchAllOrders());
        } catch (error) {
            console.error('Failed to update order status:', error);
            
            // Display a more user-friendly error message
            if (typeof error === 'string') {
                toast.error(error);
            } else if (error?.message) {
                toast.error(error.message);
            } else {
                toast.error('Failed to update order status. Please try again.');
            }
        } finally {
            setUpdatingOrderId(null);
        }
    };

    if(loading && !updatingOrderId){
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
    <div className='max-w-7xl mx-auto p-6'>
        <h2 className="text-2xl font-bold mb-6">Order Management</h2>

        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className='min-w-full text-left text-gray-500'>
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                    <tr>
                        <th className='py-3 px-4'>Order ID</th>
                        <th className='py-3 px-4'>Customer</th>
                        <th className='py-3 px-4'>Total Price</th>
                        <th className='py-3 px-4'>Status</th>
                        <th className='py-3 px-4'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order._id} className='border-b hover:bg-gray-50 cursor-pointer'>
                                {/* Order Id */}
                                <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                                    #{order._id}
                                </td>
                                {/* Customer name */}
                                <td className="p-4">{order.user?.name || 'Unknown User'}</td>
                                {/* total Price */}
                                <td className="p-4">
                                    ₵{order.totalPrice.toFixed(2) || order.TotalPrice.toFixed(2)}
                                </td>
                                {/* Status */}
                                <td className="p-4">
                                    <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                                     focus:ring-blue-500 focus:border-x-blue-500 block p-2.5 '
                                    disabled={updatingOrderId === order._id}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>

                                {/* Actions */}
                                <td className="p-4">
                                    <button
                                    onClick={() => handleStatusChange(order._id, "Delivered")}
                                    className={`${
                                        order.status === "Delivered" 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-500 hover:bg-green-600'
                                    } text-white px-4 py-2 rounded transition`}
                                    disabled={order.status === "Delivered" || updatingOrderId === order._id}
                                    >
                                        {updatingOrderId === order._id ? 'Updating...' : 'Mark as Delivered'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                    <tr>
                        <td colSpan={5} className='p-4 text-center text-gray-500'>
                            No Orders found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default OrderManagement;