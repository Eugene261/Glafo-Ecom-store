import React, { useRef, useEffect, useState } from 'react';
import { Link, Links, useLocation } from 'react-router-dom';
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
    const mobileMenuRef = useRef(null);
    const dispatch = useDispatch();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const {cart, isCartOpen} = useSelector((state) => state.cart);
    const { favorites } = useSelector((state) => state.favorites);
    const {user} = useSelector((state) => state.auth);

    // Use the page title hook
    usePageTitle();

    const cartItemsCount = cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;
    const favoritesCount = favorites.length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setNavbarDrawerOpen(false);
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

  return (
    <>
    <nav className={`${isHomePage ? 'fixed top-0 left-0 right-0' : ''} bg-white z-40 shadow-sm`}>
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
        <div className="hidden md:flex space-x-6">
            {/* Men */}
            <Link to='/collections/all?gender=Men' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>
            men
            </Link>

                {/* women */}
            <Link to='/collections/all?gender=Women' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>
            Women           </Link>

                {/* Top wear */}
            <Link to='/collections/all?category=Top Wear' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>
            Top wear
            </Link>

            {/* bottom wear */}
            <Link to='/collections/all?category=Bottom Wear' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>
            bottom wear            </Link>
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
    
    {/* Spacer only on home page */}
    {isHomePage && <div className="h-24"></div>}
    
    <CartDrawer drawerOpen={isCartOpen} toggleCartDrawer={toggleCartDrawer}/>

    {/* Mobile Navigation */}

    <div 
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform 
        transition-transform duration-300 z-50
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
            <nav className='space-y-4'>

                {/* Men */}
                <Link to='/collections/all?gender=Men'
                onClick={toggleNavDrawer}
                className='block text-gray-600 hover:text-black'>
                    Men
                </Link>


                <Link to='/collections/all?gender=Women'
                onClick={toggleNavDrawer}
                className='block text-gray-600 hover:text-black'>
                    Women
                </Link>

                <Link to='/collections/all?category=Top Wear'
                onClick={toggleNavDrawer}
                className='block text-gray-600 hover:text-black'>
                    Top Wear
                </Link>

                <Link to='/collections/all?category=Bottom Wear'
                onClick={toggleNavDrawer}
                className='block text-gray-600 hover:text-black'>
                    Bottom wear
                </Link>


                
            </nav>
        </div>


    </div>
    </>
  )
}

export default Navbar;