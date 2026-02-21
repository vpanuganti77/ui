import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close, OpenInNew, PhoneIphone } from '@mui/icons-material';
import { checkPWARedirect } from '../utils/pwaUtils';

const PWARedirectDialog: React.FC = () => {
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);

  useEffect(() => {
    // Check if should show redirect dialog after a delay
    const timer = setTimeout(() => {
      const shouldShow = checkPWARedirect();
      if (shouldShow) {
        setShowRedirectDialog(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenPWA = () => {
    // Try to open the PWA
    window.location.href = window.location.origin;
    setShowRedirectDialog(false);
  };

  const handleDismiss = () => {
    setShowRedirectDialog(false);
  };

  if (!showRedirectDialog) {
    return null;
  }

  return (
    <Dialog 
      open={showRedirectDialog} 
      onClose={handleDismiss}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mx: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIphone color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Open PGFlow App
            </Typography>
          </Box>
          <IconButton onClick={handleDismiss} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          PGFlow app is installed on your device. Would you like to open it for a better experience?
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'info.50', 
          p: 2, 
          borderRadius: 2, 
          border: '1px solid',
          borderColor: 'info.200'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            App Benefits:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
            <li>Faster performance</li>
            <li>Better mobile experience</li>
            <li>Offline access</li>
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleDismiss} color="inherit">
          Stay in Browser
        </Button>
        <Button 
          onClick={handleOpenPWA} 
          variant="contained" 
          startIcon={<OpenInNew />}
          sx={{ minWidth: 120 }}
        >
          Open App
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PWARedirectDialog;
