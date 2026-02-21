import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../types/roles';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: Permission | Permission[];
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallback
}) => {
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  if (!canAccess(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        textAlign="center"
        p={4}
      >
        <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          You don't have permission to access this resource.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
