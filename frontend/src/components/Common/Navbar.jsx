import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HiOutlineUser,
    HiOutlineShoppingBag,
    HiOutlineHeart,
    HiBars3BottomRight} from 'react-icons/hi2';
import SearchBar from './SearchBar';
import { IoMdClose } from 'react-icons/io';
import CartDrawer from '../Layout/CartDrawer';
import { useSelector, useDispatch } from 'react-redux';
import { setCartOpen } from '../../redux/slices/cartSlice';
import usePageTitle from '../../hooks/usePageTitle';

const Navbar = () => {
    const [navDrawerOpen, setNavbarDrawerOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const mobileMenuRef = useRef(null);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const {cart, isCartOpen} = useSelector((state) => state.cart);
    const { favorites } = useSelector((state) => state.favorites || {});
    const {user} = useSelector((state) => state.auth);

    // Categories for Men
    const menCategories = {
        topWear: [
            { name: "T-Shirts", path: "/collections/all?gender=Men&category=T-Shirts" },
            { name: "Shirts", path: "/collections/all?gender=Men&category=Shirts" },
            { name: "Polo Shirts", path: "/collections/all?gender=Men&category=Polo" },
            { name: "Sweatshirts", path: "/collections/all?gender=Men&category=Sweatshirts" },
            { name: "Hoodies", path: "/collections/all?gender=Men&category=Hoodies" },
            { name: "Jackets", path: "/collections/all?gender=Men&category=Jackets" }
        ],
        bottomWear: [
            { name: "Pants", path: "/collections/all?gender=Men&category=Pants" },
            { name: "Shorts", path: "/collections/all?gender=Men&category=Shorts" },
            { name: "Jeans", path: "/collections/all?gender=Men&category=Jeans" },
            { name: "Sweatpants", path: "/collections/all?gender=Men&category=Sweatpants" }
        ],
        footwear: [
            { name: "Sneakers", path: "/collections/all?gender=Men&category=Sneakers" },
            { name: "Running Shoes", path: "/collections/all?gender=Men&category=Running" },
            { name: "Casual Shoes", path: "/collections/all?gender=Men&category=Casual" }
        ]
    };

    // Categories for Women
    const womenCategories = {
        topWear: [
            { name: "T-Shirts", path: "/collections/all?gender=Women&category=T-Shirts" },
            { name: "Blouses", path: "/collections/all?gender=Women&category=Blouses" },
            { name: "Tops", path: "/collections/all?gender=Women&category=Tops" },
            { name: "Sweatshirts", path: "/collections/all?gender=Women&category=Sweatshirts" },
            { name: "Hoodies", path: "/collections/all?gender=Women&category=Hoodies" }
        ],
        bottomWear: [
            { name: "Pants", path: "/collections/all?gender=Women&category=Pants" },
            { name: "Shorts", path: "/collections/all?gender=Women&category=Shorts" },
            { name: "Skirts", path: "/collections/all?gender=Women&category=Skirts" },
            { name: "Jeans", path: "/collections/all?gender=Women&category=Jeans" },
            { name: "Leggings", path: "/collections/all?gender=Women&category=Leggings" }
        ],
        footwear: [
            { name: "Sneakers", path: "/collections/all?gender=Women&category=Sneakers" },
            { name: "Flats", path: "/collections/all?gender=Women&category=Flats" },
            { name: "Heels", path: "/collections/all?gender=Women&category=Heels" }
        ]
    };

    // Use the page title hook
    usePageTitle();

    const cartItemsCount = cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;
    const favoritesCount = favorites?.length || 0;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setNavbarDrawerOpen(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleNavDrawer = ()=> {
        setNavbarDrawerOpen(!navDrawerOpen);
    };

    const toggleCartDrawer = () =>{
        dispatch(setCartOpen(!isCartOpen));
    };

    const handleDropdownHover = (dropdown) => {
        setActiveDropdown(dropdown);
    };

    return (
    <>
    <nav className="bg-white z-40 shadow-sm">
      <div className='container mx-auto flex items-center justify-between py-4 px-6'>
        {/* Left - Logo */}
        <div className="flex items-center">
            <Link to="/" className="block text-center">
                <div className="flex flex-col items-center">
                    <span className="font-playfair text-3xl tracking-wider font-bold">GLAFO</span>
                    <span className="text-xs text-gray-600 font-light tracking-widest mt-1">BUY IT</span>
                </div>
            </Link>
        </div>
        {/* center navigation links */}
        <div className="hidden md:flex space-x-12 items-center justify-center" ref={dropdownRef}>
            {/* Men with Dropdown */}
            <div className="relative group"
                 onMouseEnter={() => handleDropdownHover('men')}
                 onMouseLeave={() => setActiveDropdown(null)}>
                <Link to='/collections/all?gender=Men' 
                    className='text-gray-900 hover:text-black hover:underline text-base font-bold tracking-wide uppercase'>
                    Men
                </Link>
                
                {activeDropdown === 'men' && (
                    <div className="absolute left-0 bg-white border border-gray-200 shadow-lg z-50 mt-1 py-4 w-auto min-w-[600px]">
                        <div className="flex gap-6 px-6">
                            {/* Top Wear Section */}
                            <div className="w-1/3">
                                <h3 className="font-medium text-gray-900 mb-3 uppercase text-sm">Top Wear</h3>
                                <ul className="space-y-1 mb-2">
                                    {menCategories.topWear.map((item) => (
                                        <li key={item.name}>
                                            <Link to={item.path} className="text-sm text-gray-700 hover:text-black block py-1">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="/collections/all?gender=Men&category=Top Wear" className="text-sm font-medium text-gray-900 hover:underline block py-1 mt-2">
                                            All Men's Top Wear
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Bottom Wear Section */}
                            <div className="w-1/3">
                                <h3 className="font-medium text-gray-900 mb-3 uppercase text-sm">Bottom Wear</h3>
                                <ul className="space-y-1 mb-2">
                                    {menCategories.bottomWear.map((item) => (
                                        <li key={item.name}>
                                            <Link to={item.path} className="text-sm text-gray-700 hover:text-black block py-1">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="/collections/all?gender=Men&category=Bottom Wear" className="text-sm font-medium text-gray-900 hover:underline block py-1 mt-2">
                                            All Men's Bottom Wear
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Footwear Section */}
                            <div className="w-1/3">
                                <h3 className="font-medium text-gray-900 mb-3 uppercase text-sm">Footwear</h3>
                                <ul className="space-y-1">
                                    {menCategories.footwear.map((item) => (
                                        <li key={item.name}>
                                            <Link to={item.path} className="text-sm text-gray-700 hover:text-black block py-1">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="/collections/all?gender=Men&category=Footwear" className="text-sm font-medium text-gray-900 hover:underline block py-1 mt-2">
                                            All Men's Footwear
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Women with Dropdown */}
            <div className="relative group"
                 onMouseEnter={() => handleDropdownHover('women')}
                 onMouseLeave={() => setActiveDropdown(null)}>
                <Link to='/collections/all?gender=Women' 
                    className='text-gray-900 hover:text-black hover:underline text-base font-bold tracking-wide uppercase'>
                    Women
                </Link>
                
                {activeDropdown === 'women' && (
                    <div className="absolute left-0 bg-white border border-gray-200 shadow-lg z-50 mt-1 py-4 w-auto min-w-[600px]">
                        <div className="flex gap-6 px-6">
                            {/* Top Wear Section */}
                            <div className="w-1/3">
                                <h3 className="font-medium text-gray-900 mb-3 uppercase text-sm">Top Wear</h3>
                                <ul className="space-y-1 mb-2">
                                    {womenCategories.topWear.map((item) => (
                                        <li key={item.name}>
                                            <Link to={item.path} className="text-sm text-gray-700 hover:text-black block py-1">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="/collections/all?gender=Women&category=Top Wear" className="text-sm font-medium text-gray-900 hover:underline block py-1 mt-2">
                                            All Women's Top Wear
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Bottom Wear Section */}
                            <div className="w-1/3">
                                <h3 className="font-medium text-gray-900 mb-3 uppercase text-sm">Bottom Wear</h3>
                                <ul className="space-y-1 mb-2">
                                    {womenCategories.bottomWear.map((item) => (
                                        <li key={item.name}>
                                            <Link to={item.path} className="text-sm text-gray-700 hover:text-black block py-1">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="/collections/all?gender=Women&category=Bottom Wear" className="text-sm font-medium text-gray-900 hover:underline block py-1 mt-2">
                                            All Women's Bottom Wear
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Footwear Section */}
                            <div className="w-1/3">
                                <h3 className="font-medium text-gray-900 mb-3 uppercase text-sm">Footwear</h3>
                                <ul className="space-y-1">
                                    {womenCategories.footwear.map((item) => (
                                        <li key={item.name}>
                                            <Link to={item.path} className="text-sm text-gray-700 hover:text-black block py-1">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="/collections/all?gender=Women&category=Footwear" className="text-sm font-medium text-gray-900 hover:underline block py-1 mt-2">
                                            All Women's Footwear
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sale Link */}
            <Link to='/collections/all?onSale=true' className='text-red-600 hover:text-red-700 hover:underline text-base font-bold tracking-wide uppercase'>
                Sale
            </Link>
        </div>


        {/* Right - ICONS */}
        <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
                <Link to='/admin' className='block bg-black px-2 rounded text-sm text-white'>Admin</Link>
            )}
            <Link to='/profile' className='hover:text-black'>
            <HiOutlineUser  className='h-6 w-6 text-gray-700'/>
            </Link>

            {/* Favorites */}
            <Link to='/favorites' className='relative hover:text-black'>
                <HiOutlineHeart className='h-6 w-6 text-gray-700' />
                {favoritesCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                        {favoritesCount}
                    </span>
                )}
            </Link>

            {/* cart */}
            <button
            onClick={toggleCartDrawer}
            className='relative hover:text-black'>
                <HiOutlineShoppingBag className='h-6 w-6 text-gray-700' />
                {cartItemsCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-rabbit-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                        {cartItemsCount}
                    </span>
                )}
                
            </button>
             
            {/* search */}
            <div className="overflow-hidden">
            <SearchBar />
            </div>
           



            <button
            onClick={toggleNavDrawer}
             className='md:hidden'>
                <HiBars3BottomRight className='h-6 w-6 text-gray-700' />
            </button>
        </div>
    </div>
    </nav>
    
    {/* No spacer needed since we're not using fixed positioning */}
    
    <CartDrawer drawerOpen={isCartOpen} toggleCartDrawer={toggleCartDrawer}/>

    {/* Mobile Navigation */}

    <div 
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform 
        transition-transform duration-300 z-50 overflow-auto
      ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"} `}>
        <div className="flex justify-between items-center p-4">
            <Link to='/' onClick={toggleNavDrawer}>
                <div className="flex flex-col items-center">
                    <span className="font-playfair text-2xl tracking-wider font-bold">GLAFO</span>
                    <span className="text-xs text-gray-600 font-light tracking-widest">BUY IT</span>
                </div>
            </Link>
            <button onClick={toggleNavDrawer}>
                <IoMdClose className='h-6 w-6 text-gray-600' />
            </button>
        </div>
        <div className="p-4 ">
            <h2 className='text-xl font-semibold mb-4'>Menu</h2>
            <nav className='space-y-2'>

                {/* Men */}
                <div>
                    <Link to='/collections/all?gender=Men'
                    onClick={toggleNavDrawer}
                    className='block text-gray-800 font-medium hover:text-black py-2'>
                        Men
                    </Link>
                    
                    <div className="ml-4 space-y-1 mt-1">
                        <Link to='/collections/all?gender=Men&category=Top Wear'
                        onClick={toggleNavDrawer}
                        className='block text-gray-600 hover:text-black text-sm py-1'>
                            Top Wear
                        </Link>
                        <Link to='/collections/all?gender=Men&category=Bottom Wear'
                        onClick={toggleNavDrawer}
                        className='block text-gray-600 hover:text-black text-sm py-1'>
                            Bottom Wear
                        </Link>
                        <Link to='/collections/all?gender=Men&category=Footwear'
                        onClick={toggleNavDrawer}
                        className='block text-gray-600 hover:text-black text-sm py-1'>
                            Footwear
                        </Link>
                    </div>
                </div>

                {/* Women */}
                <div>
                    <Link to='/collections/all?gender=Women'
                    onClick={toggleNavDrawer}
                    className='block text-gray-800 font-medium hover:text-black py-2'>
                        Women
                    </Link>
                    
                    <div className="ml-4 space-y-1 mt-1">
                        <Link to='/collections/all?gender=Women&category=Top Wear'
                        onClick={toggleNavDrawer}
                        className='block text-gray-600 hover:text-black text-sm py-1'>
                            Top Wear
                        </Link>
                        <Link to='/collections/all?gender=Women&category=Bottom Wear'
                        onClick={toggleNavDrawer}
                        className='block text-gray-600 hover:text-black text-sm py-1'>
                            Bottom Wear
                        </Link>
                        <Link to='/collections/all?gender=Women&category=Footwear'
                        onClick={toggleNavDrawer}
                        className='block text-gray-600 hover:text-black text-sm py-1'>
                            Footwear
                        </Link>
                    </div>
                </div>

                {/* Sale */}
                <Link to='/collections/all?onSale=true'
                onClick={toggleNavDrawer}
                className='block text-gray-800 font-medium hover:text-black py-2'>
                    Sale
                </Link>
            </nav>
        </div>
    </div>
    </>
  )
}

export default Navbar;