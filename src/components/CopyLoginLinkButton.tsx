import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { copyLoginLinkToClipboard } from '../utils/loginLink';

interface CopyLoginLinkButtonProps {
  email: string;
  password: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

const CopyLoginLinkButton: React.FC<CopyLoginLinkButtonProps> = ({
  email,
  password,
  variant = 'outlined',
  size = 'small'
}) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleCopyLink = async () => {
    try {
      await copyLoginLinkToClipboard(email, password);
      setSnackbar({ open: true, message: 'Login link copied to clipboard!' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to copy link' });
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={<ContentCopy />}
        onClick={handleCopyLink}
      >
        Copy Login Link
      </Button>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CopyLoginLinkButton;
