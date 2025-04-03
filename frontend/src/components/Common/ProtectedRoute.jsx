import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({children, role}) => {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if(!user || (role && user.role !== role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute