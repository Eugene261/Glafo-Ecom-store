import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser } from 'react-icons/hi';
import mainLogo from '../../assets/BrandKit/main-logo-black-transparent.svg';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const { favorites } = useSelector((state) => state.favorites);

    return (
        <nav className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="block h-12 w-auto">
                            <img src={mainLogo} alt="Glafo" className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden sm:flex sm:space-x-8 sm:items-center">
                        <Link to="/" className="text-gray-900 hover:text-gray-500 px-3 py-2 text-sm font-medium">
                            Home
                        </Link>
                        <Link to="/collections/all" className="text-gray-900 hover:text-gray-500 px-3 py-2 text-sm font-medium">
                            Collections
                        </Link>
                        <Link to="/about" className="text-gray-900 hover:text-gray-500 px-3 py-2 text-sm font-medium">
                            About
                        </Link>
                        <Link to="/contact" className="text-gray-900 hover:text-gray-500 px-3 py-2 text-sm font-medium">
                            Contact
                        </Link>
                    </div>

                    {/* Right side icons */}
                    <div className="flex items-center space-x-4">
                        <Link to="/favorites" className="text-gray-900 hover:text-gray-500 relative">
                            <HiOutlineHeart className="h-6 w-6" />
                            {favorites?.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {favorites.length}
                                </span>
                            )}
                        </Link>
                        <Link to="/cart" className="text-gray-900 hover:text-gray-500 relative">
                            <HiOutlineShoppingBag className="h-6 w-6" />
                            {cartItems?.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                        <Link to={user ? "/profile" : "/login"} className="text-gray-900 hover:text-gray-500">
                            <HiOutlineUser className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 