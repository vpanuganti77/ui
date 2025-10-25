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
    if (!user || user.role === 'master_admin') {
      return;
    }

    const checkStatus = async () => {
      const result = await validateUserStatus();
      if (!result.isValid) {
        setValidationDialog({
          open: true,
          message: result.message || 'Your account access has been restricted.'
        });
      }
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
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