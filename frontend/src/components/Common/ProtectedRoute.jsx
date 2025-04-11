import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({children, role}) => {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // If no user is logged in, redirect to login
  if(!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If role is specified, check if user has the required role
  if(role) {
    // Allow superAdmin to access admin routes
    if(role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
      return children;
    }
    // For specific role requirements
    else if(user.role !== role) {
      console.log(`Access denied: User role ${user.role} does not match required role ${role}`);
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
}

export default ProtectedRoute