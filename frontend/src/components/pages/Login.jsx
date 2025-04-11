import React, { useEffect, useState } from 'react'
import login from '../../assets/login.webp'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { mergeCart } from '../../redux/slices/cartSlice';
import { API_URL } from '../../config/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const {user, guestId, loading, error} = useSelector((state) => state.auth);
    const { cart } = useSelector((state) => state.cart);
    const [backendStatus, setBackendStatus] = useState(true); // Track backend connectivity

    // Get redirect parameter and check if it;s checkout or something
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    const isCheckoutRedirect = redirect.includes("checkout");

    // Check backend connectivity on component mount
    useEffect(() => {
        fetch(`${API_URL}/`)
            .then(response => {
                if (response.ok) {
                    setBackendStatus(true);
                    console.log('Backend is reachable');
                } else {
                    setBackendStatus(false);
                    console.error('Backend returned error status:', response.status);
                }
            })
            .catch(err => {
                console.error('Cannot connect to backend:', err);
                setBackendStatus(false);
            });
    }, []);

    useEffect(() => {
        if(user) {
            // Check if user is admin or superAdmin
            const isAdmin = user.role === 'admin' || user.role === 'superAdmin';
            
            // If user is admin, redirect to admin dashboard
            if (isAdmin) {
                console.log('Admin user detected, redirecting to admin dashboard');
                navigate('/admin');
            } else if (cart?.products.length > 0 && guestId) {
                // For regular users with items in cart
                dispatch(mergeCart({ guestId, user })).then(() => {
                    navigate(isCheckoutRedirect ? "/checkout" : "/");
                });
            } else {
                // For regular users without items in cart
                navigate(isCheckoutRedirect ? "/checkout" : "/");
            }
        }
    }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);


    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (!backendStatus) {
            alert('Cannot connect to the server. Please try again later.');
            return;
        }
        dispatch(loginUser({email, password}));
    }


  return (
    <div className='flex '>
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
            <form
             onSubmit={handleSubmit}
             action=""
             className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
                <div className="flex justify-center mb-6 ">
                    <h2 className="text-xl font-medium "> Glafo</h2>
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">
                    Hey there!  👋🏾
                </h2>
                <p className="text-center mb-6">
                    Enter your username and password to Login
                </p>
                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="" className='block text-sm font-semibold mb-2'>Email</label>
                    <input type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded" 
                    placeholder='Enter your email'
                    />
                </div>

                {/* password */}
                <div className="mb-4">
                    <label htmlFor="" className='block text-sm font-semibold mb-2'>Password</label>
                    <input
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full p-2 border rounded'
                    placeholder='Enter your password'
                    />
                </div>

                {/* Display error message if there is one */}
                {error && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                {!backendStatus && (
                    <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                        Cannot connect to the server. Please check your connection.
                    </div>
                )}
                
                <button type='submit' className='w-full bg-black text-white p-2 rounded-lg font-semibold
                     hover:bg-gray-800 transition' disabled={loading || !backendStatus}> 
                     {loading ? "Signing In..." : "Sign In"}
                </button>
                <p className="mt-6 text-center text-sm">
                    Don't have an account? {' '}
                    <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} 
                    className='text-blue-500 '>
                    Register
                    </Link>
                </p>
            </form>
        </div>


        {/* Right side Image */}
        <div className="hidden md:block w-1/2 bg-gray-800">
            <div className="h-full flex flex-col justify-center items-center ">
                <img
                src={login}
                alt="Login to accont" 
                className='h-[750px] w-full object-cover  '
                />
            </div>
        </div>

    </div>
  )
}

export default Login