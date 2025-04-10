import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import PayPalButton from './PayPalButton';
import { useDispatch, useSelector } from 'react-redux';
import { createCheckout } from '../../redux/slices/checkoutSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import axios from 'axios';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {cart, loading, error} = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const [checkoutId, setCheckoutId] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({
        firstName : "",
        lastName : "",
        address : "",
        city : "",
        postalCode : "",
        country : "",
        phone : "",
    });

    // Ensure cart is loaded and user is authenticated before proceeding
    useEffect(() => {
        if (!user) {
            const currentPath = window.location.pathname;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        // Only redirect to home if cart is empty and we're not processing payment
        if (!isProcessingPayment && (!cart || !cart.products || cart.products.length === 0)) {
            navigate("/");
            return;
        }
    }, [cart, navigate, user, isProcessingPayment]);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        if (cart && cart.products.length > 0) {
            try {
                // Format shipping address to match backend expectations
                const formattedShippingAddress = {
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                    additionalDetails: {
                        firstName: shippingAddress.firstName,
                        lastName: shippingAddress.lastName,
                        phone: shippingAddress.phone
                    }
                };

                // Debug log to check cart products structure
                console.log('Cart products:', cart.products);

                // Format checkout items to ensure all required fields are present
                const formattedCheckoutItems = cart.products.map(item => {
                    // Basic required fields
                    if (!item.productId || !item.name || !item.price || !item.quantity) {
                        console.error('Invalid item:', item);
                        throw new Error(`Missing basic required fields for item: ${item.name || 'Unknown item'}`);
                    }

                    // Set default values for size and color if they're empty
                    const size = item.size || 'One Size';
                    const color = item.color || 'Default';

                    return {
                        productId: item.productId.toString(), // Ensure productId is a string
                        name: item.name,
                        image: item.image || '', // Make image optional
                        price: Number(item.price), // Ensure price is a number
                        quantity: Number(item.quantity), // Ensure quantity is a number
                        size: size,
                        color: color
                    };
                });

                // Debug logs
                console.log('Formatted checkout items:', formattedCheckoutItems);

                const checkoutData = {
                    checkoutItems: formattedCheckoutItems,
                    shippingAddress: formattedShippingAddress,
                    paymentMethod: "PayPal",
                    totalPrice: Number(cart.totalPrice), // Ensure totalPrice is a number
                };

                console.log('Checkout data:', checkoutData);

                const res = await dispatch(createCheckout(checkoutData)).unwrap();

                if (res && res._id) {
                    setCheckoutId(res._id);
                } else {
                    throw new Error('Failed to create checkout');
                }
            } catch (error) {
                console.error('Checkout creation error:', error);
                // Show more detailed error message
                const errorMessage = error.response?.data?.message || error.message || 'There was an error creating your checkout. Please try again.';
                alert(errorMessage);
            }
        }
    };

    const handlePaymentSuccess = async(details) => {
        try {
            setIsProcessingPayment(true);
            // First update payment status
            const paymentResponse = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
                {
                    paymentStatus: "paid",
                    paymentDetails: details
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`
                    }
                }
            );

            if (paymentResponse.status === 200) {
                // Only proceed to finalize if payment update was successful
                await handleFinalizedCheckout(checkoutId);
            }
        } catch (error) {
            console.error('Payment processing error:', error.response?.data || error.message);
            alert('There was an error processing your payment. Please contact support.');
            setIsProcessingPayment(false);
        }
    };

    const handleFinalizedCheckout = async (checkoutId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`
                    }
                }
            );

            // Check for both 200 and 201 status codes
            if (response.status === 200 || response.status === 201) {
                // Clear the cart first
                dispatch(clearCart());
                
                // Then navigate to order confirmation
                navigate("/order-confirmation", { 
                    state: { 
                        order: response.data,
                        isNewOrder: true 
                    },
                    replace: true
                });
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        } catch (error) {
            console.error('Checkout finalization error:', error.response?.data || error.message);
            alert('There was an error finalizing your order. Please contact support.');
            setIsProcessingPayment(false);
        }
    };

    if (loading) return <p>Loading cart...</p>
    if (error) return <p>Error: {error}</p>
    if(!cart || !cart.products || cart.products.length === 0) {
        return <p>Your cart is empty</p>
    }

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter'>
            {/* Left section */}
            <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl uppercase mb-6">Checkout</h2>
                <form onSubmit={handleCreateCheckout} >
                    <h3 className="text-lg mb-4">
                        Contact Details
                    </h3>
                    <div className="mb-4 ">
                        <label className='block text-gray-700'>Email</label>
                        <input
                        type="email"
                        value={user? user.email : ""}
                        className="w-full p-2 border rounded" 
                        disabled
                        />
                    </div>
                    <h3 className='text-lg mb-4'>Delivery</h3>
                    {/* First & Last Name */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div >
                            <label htmlFor="" className='bolck text-gray-700'>First Name</label>
                            <input
                            type="text"
                            value={shippingAddress.firstName} 
                            onChange={(e) => 
                                setShippingAddress({
                                    ...shippingAddress, 
                                    firstName: e.target.value
                                })
                            }
                            className='w-full p-2 border rounded'
                            required
                            />
                        </div>

                        <div >
                            <label htmlFor="" className='bolck text-gray-700'>Last Name</label>
                            <input
                            type="text"
                            value={shippingAddress.lastName} 
                            onChange={(e) => 
                                setShippingAddress({
                                    ...shippingAddress, 
                                    lastName: e.target.value
                                })
                            }
                            className='w-full p-2 border rounded'
                            required
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4 ">
                        <label htmlFor="" className='block text-gray-700'>Addres</label>
                        <input
                        type="text"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                        className='w-full p-2 border rounded'
                        required
                        />
                    </div>

                    {/* City & Postal Code */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div >
                            <label htmlFor="" className='bolck text-gray-700'>City</label>
                            <input
                            type="text"
                            value={shippingAddress.city} 
                            onChange={(e) => 
                                setShippingAddress({
                                    ...shippingAddress, 
                                    city: e.target.value
                                })
                            }
                            className='w-full p-2 border rounded'
                            required
                            />
                        </div>

                        <div >
                            <label htmlFor="" className='bolck text-gray-700'>Postal Code</label>
                            <input
                            type="text"
                            value={shippingAddress.postalCode} 
                            onChange={(e) => 
                                setShippingAddress({
                                    ...shippingAddress, 
                                    postalCode: e.target.value
                                })
                            }
                            className='w-full p-2 border rounded'
                            required
                            />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="mb-4 ">
                        <label htmlFor="" className='block text-gray-700'>Country</label>
                        <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className='w-full p-2 border rounded'
                        required
                        />
                    </div>

                    {/* Phone */}
                    <div className="mb-4 ">
                        <label htmlFor="" className='block text-gray-700'>Phone</label>
                        <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className='w-full p-2 border rounded'
                        required
                        />
                    </div>

                    <div className="mt-6">
                        {!checkoutId ? (
                            <button type="submit" className='w-full bg-black text-white py-3 rounded'>
                            Continue to Payment
                        </button>
                        ) : (
                            <div>
                                <h3 className="text-lg mb-4">Pay with PayPal</h3>
                                {/* PayPal component */}
                                <PayPalButton 
                                amount={cart.totalPrice}
                                onSuccess={handlePaymentSuccess}
                                onError={(err) => alert("Payment failed. Try again.")}/>
                            </div>
                        )}
                    </div>

                </form>
            </div>

            {/* Right Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg mb-4">Order Summary</h3>
                <div className="border-t py-4 mb-4">
                    {cart.products.map((product, index) => (
                        <div
                        key={index}
                        className='flex items-start justify-between py-2 border-b'
                    >
                        <div className="flex items-start">
                            <img
                            src={product.image}
                            alt={product.name}
                            className='w-20 h-24 object-cover mr-4'
                            />
                            <div >
                            <h3 className="text-md">{product.name}</h3>
                            <p className="text-gray-500">Size: {product.size}</p>
                            <p className="text-gray-500">Color: {product.color}</p>
                            </div>
                        </div>
                        <p className="text-xl">${product.price?.toLocaleString()}</p>
                    </div>
                    ))}
                </div>
                <div className="flex justify-between items-center text-lg mb-4">
                    <p>Subtotal</p>
                    <p>${cart.totalPrice?.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <p>Shipping</p>
                    <p>Free</p>
                </div>
                <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
                    <p>Total</p>
                    <p>${cart.totalPrice?.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

export default Checkout