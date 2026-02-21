import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { validateUserStatus, ValidationResult } from '../services/statusValidationService';
import RestrictedAccess from '../pages/RestrictedAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const result = await validateUserStatus();
      setValidationResult(result);
      setIsLoading(false);
    };

    if (!authLoading) {
      checkStatus();
    }
  }, [isAuthenticated, user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Check user/hostel status - allow pending approval users to access dashboard
  if (!validationResult?.isValid && validationResult?.reason !== 'hostel_pending') {
    return (
      <RestrictedAccess 
        reason={validationResult?.reason || 'user_deleted'} 
        message={validationResult?.message || 'Access denied'} 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
