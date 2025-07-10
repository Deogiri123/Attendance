import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAppContext();
  const location = useLocation();
  
  useEffect(() => {
    if (!token && location.pathname !== '/') {
      toast.error('Please log in to access this page');
    }
  }, [token, location.pathname]);

  if (!token) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
