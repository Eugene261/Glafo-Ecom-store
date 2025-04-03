import React, { useEffect, useState } from 'react'
import register from '../../assets/register.webp'
import { registerUser } from '../../redux/slices/authSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { mergeCart } from '../../redux/slices/cartSlice';

const Register = () => {
    const [name, setName] = useState(""); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const location = useLocation();
    const {user, guestId} = useSelector((state) => state.auth);
    const { cart } = useSelector((state) => state.cart);

    // Get the redirect path from the URL
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get("redirect") || "/";

    useEffect(() => {
        // If user is logged in
        if(user) {
            // If there's a cart to merge
            if (cart?.products?.length > 0 && guestId) {
                dispatch(mergeCart({ guestId, user }))
                    .then(() => {
                        // After merging cart, redirect to the saved path
                        navigate(redirectPath);
                    });
            } else {
                // No cart to merge, just redirect
                navigate(redirectPath);
            }
        }
    }, [user, guestId, cart, navigate, redirectPath, dispatch]);

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        await dispatch(registerUser({name, email, password}));
    }

    return (
        <div className='flex'>
            {/* Left Side */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
                    <div className="flex justify-center mb-6">
                        <h2 className="text-xl font-medium">Glafo</h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Create an Account
                    </h2>
                    <p className="text-center mb-6">
                        Please fill in your details to create an account
                    </p>

                    <div className="mb-4">
                        <label htmlFor="name" className='block text-sm font-semibold mb-2'>Name</label>
                        <input 
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded" 
                            placeholder='Enter your name'
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className='block text-sm font-semibold mb-2'>Email</label>
                        <input 
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded" 
                            placeholder='Enter your email'
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className='block text-sm font-semibold mb-2'>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full p-2 border rounded'
                            placeholder='Enter your password'
                            required
                        />
                    </div>

                    <button 
                        type='submit' 
                        className='w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition'
                    > 
                        Sign Up
                    </button>
                    <p className="mt-6 text-center text-sm">
                        Already have an account? {' '}
                        <Link 
                            to={`/login?redirect=${encodeURIComponent(redirectPath)}`} 
                            className='text-blue-500'
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>

            {/* Right side Image */}
            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img
                        src={register}
                        alt="Register account" 
                        className='h-[750px] w-full object-cover'
                    />
                </div>
            </div>
        </div>
    )
}

export default Register