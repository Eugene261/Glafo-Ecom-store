import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserLayout from './components/Layout/UserLayout'
import Home from './components/pages/Home';
import {Toaster} from 'sonner';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Profile from './components/pages/Profile';
import CollectionPage from './components/pages/CollectionPage';
import ProductsDetails from './components/Products/ProductsDetails';
import Checkout from './components/Cart/Checkout';
import OrderConfirmationPage from './components/pages/OrderConfirmationPage';
import OrderDetailsPage from './components/pages/OrderDetailsPage';
import MyOrderPage from './components/pages/MyOrderPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './components/pages/AdminHomePage';
import UserManagement from './components/pages/UserManagement';
import ProductManagement from './components/Admin/ProductManagement';
import EditProductPage from './components/Admin/EditProductPage';
import OrderManagement from './components/Admin/OrderManagement';
import FavoritesPage from './components/pages/FavoritesPage';
import ProtectedRoute from './components/Common/ProtectedRoute';

import {Provider} from "react-redux";
import store from "./redux/store.js";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter >
      <Toaster position='top-right' />
      <Routes>
        <Route path='/' element={<UserLayout/>}>
        <Route index element={<Home/>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/collections/:collection' element={<CollectionPage />} />
        <Route path='/product/:id' element={<ProductsDetails />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/order-confirmation' element={<OrderConfirmationPage />} />
        <Route path='/order/:id' element={<OrderDetailsPage />} />
        <Route path='/my-orders' element={<MyOrderPage />} />
        <Route path='/favorites' element={<FavoritesPage />} />
        </Route>

        <Route path='/admin' element={<ProtectedRoute role='admin'>
          <AdminLayout/>
        </ProtectedRoute>} >
          <Route index element={<AdminHomePage/>} />
          <Route path='users' element={<ProtectedRoute role='superAdmin'><UserManagement /></ProtectedRoute>} />
          <Route path='products' element={<ProductManagement />} />
          <Route path='products/:id/edit' element={<EditProductPage />} />
          <Route path='orders' element={<OrderManagement />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App