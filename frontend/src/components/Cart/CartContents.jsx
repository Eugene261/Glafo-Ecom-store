import React from 'react'
import { RiDeleteBin3Line } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateCartItemQuantity } from '../../redux/slices/cartSlice';


const CartContents = ({cart, userId, guestId}) => {

    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.cart); 

    // Handle adding or subtracting quantity of items in cart
    const handleAddToCart = (productId, delta, currentQuantity, size, color) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity > 0) {
            dispatch(updateCartItemQuantity({
                productId,
                quantity: newQuantity,  // Send the new absolute quantity
                size,
                color,
                userId,
                guestId,
            }));
        } else {
            // Remove if quantity would be 0
            dispatch(removeFromCart({
                productId,
                userId,
                guestId,
                size,
                color
            }));
        }
    };


    // Handle removing item from cart
    const handleRemoveFromCart = (productId, size, color) => {
        dispatch(removeFromCart({
            productId,
            userId,
            guestId,
            size, 
            color
        }));
    };

  return (
    <div>
        {
            cart.products.map((product, index) =>(
                <div key={index} className='flex items-start justify-between py-4 border-b'>

                    <div className="flex items-start">
                        <img
                         src={product.image}
                          alt={product.name}
                          className='w-20 h-20 object-cover mr-4 rounded' />
                          <div>
                            <h3>{product.name}</h3>
                            <p className='text-sm text-gray-500'>
                                size: {product.size} | color: {product.color}
                            </p>
                            <div className="flex items-center mt-2">

                                {/* Decrement Button (-) with loading state */}
                                <button 
                                onClick={() => handleAddToCart(
                                    product.productId, 
                                    -1, 
                                    product.quantity, 
                                    product.size, 
                                    product.color
                                )}
                                className={`border rounded px-2 py-1 text-xl font-medium ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}>
                                    {loading ? '...' : '-'}
                                </button>
                                <span className='mx-4'>{product.quantity}</span>


                                {/* Increment Button (+) with loading state */}
                                <button  
                                onClick={() => handleAddToCart(
                                    product.productId, 
                                    1, 
                                    product.quantity, 
                                    product.size, 
                                    product.color
                                )}
                                className={`border rounded px-2 py-1 text-xl font-medium ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}>
                                    {loading ? '...' : '+'}
                                </button>
                            </div>
                          </div>
                    </div>
                    <div>
                        <p>$ {product.price.toLocaleString() }</p>
                        <button onClick={() => handleRemoveFromCart(product.productId, product.size, product.color)}>
                            <RiDeleteBin3Line className='h-6 w-6 mt-2 text-red-600' />
                        </button>
                    </div>
                 </div>
            ))
        }
    </div>
  )
}

export default CartContents