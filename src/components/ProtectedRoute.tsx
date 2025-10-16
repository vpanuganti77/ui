import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'master_admin' | 'admin' | 'receptionist' | 'tenant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const getRedirectPath = (role: string) => {
      switch (role) {
        case 'master_admin': return '/master-admin/dashboard';
        case 'admin': return '/admin/dashboard';
        case 'receptionist': return '/receptionist/dashboard';
        case 'tenant': return '/tenant/dashboard';
        default: return '/login';
      }
    };
    return <Navigate to={getRedirectPath(user?.role || '')} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;