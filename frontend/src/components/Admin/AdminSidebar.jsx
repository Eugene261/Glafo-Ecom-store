import React from 'react'
import { FaBookOpen, FaClipboardList, FaSignOutAlt, FaStore, FaUser } from 'react-icons/fa'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { logout as adminLogout } from '../../redux/slices/adminAuthSlice';
import { logout as userLogout, isSuperAdmin } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const isSuperAdminUser = isSuperAdmin(user);

    const handleLogout = () => {
        // Logout from both admin and user states
        dispatch(adminLogout());
        dispatch(userLogout());
        dispatch(clearCart());
        
        // Clear any stored tokens
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        
        // Redirect to login page
        navigate('/login', { replace: true });
    };

    return (
        <div className='p-6'>
            <div className="mb-6">
                <Link to='/admin' className='text-2xl font-medium'>
                    Glafo
                </Link>
            </div>
            <h2 className="text-xl font-medium mb-6 text-center">Admin Dashboard</h2>

            <nav className='flex flex-col space-y-2'>
                {isSuperAdminUser && (
                    <NavLink to='/admin/users' 
                        className={({isActive}) => isActive ? 
                        "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" :
                        "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                        <FaUser />
                        <span className="">Users</span>
                    </NavLink>
                )}

                <NavLink to='/admin/products' 
                    className={({isActive}) => isActive ? 
                    "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" :
                    "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center  space-x-2"}>
                    <FaBookOpen />
                    <span>Products</span>
                </NavLink>

                <NavLink to='/admin/orders' 
                    className={({isActive}) => isActive ? 
                    "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" :
                    "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                    <FaClipboardList />
                    <span className="">Orders</span>
                </NavLink>

                <NavLink to='/' 
                    className={({isActive}) => isActive ? 
                    "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" :
                    "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                    <FaStore />
                    <span className="">Shop</span>
                </NavLink>

                <div className="mt-6">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4
                        rounded flex items-center justify-center space-x-2">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default AdminSidebar