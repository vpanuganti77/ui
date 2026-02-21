import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateUserStatus } from '../services/statusValidationService';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface StatusValidatorProps {
  children: React.ReactNode;
}

const StatusValidator: React.FC<StatusValidatorProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: '' });

  useEffect(() => {
    // StatusValidator disabled - status validation handled by other components:
    // - PendingApprovalWrapper handles pending_approval users
    // - Layout component handles deactivated hostel restrictions
    // - Login handles deleted users
    return;
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setValidationDialog({ open: false, message: '' });
  };

  return (
    <>
      {children}
      <Dialog
        open={validationDialog.open}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Account Access Restricted</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {validationDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} variant="contained" color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StatusValidator;
