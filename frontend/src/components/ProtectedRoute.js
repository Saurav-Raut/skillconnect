import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userInfo, token } = useSelector((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userInfo?.email?.toLowerCase().includes('admin') ? 'admin' : userInfo?.role;
  if (allowedRoles && userInfo && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
