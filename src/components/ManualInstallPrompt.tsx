import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close, GetApp } from '@mui/icons-material';

const ManualInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Only show on mobile devices
    if (!isMobile) return;

    // Check if already installed or prompt shown
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone;
    const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
    const isPWAInstalled = localStorage.getItem('pwa-installed');

    if (!isStandalone && !hasShownPrompt && !isPWAInstalled) {
      // Show after 5 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleInstall = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    if (isIOS) {
      instructions = 'Tap the Share button (⬆️) at the bottom and select "Add to Home Screen"';
    } else if (isAndroid) {
      instructions = 'Tap the menu (⋮) and select "Add to Home screen" or "Install app"';
    } else {
      instructions = 'Look for "Add to Home Screen" or "Install" option in your browser menu';
    }
    
    alert(`To install PGFlow:\n\n${instructions}`);
    
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 90, sm: 24 } }}
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          alignItems: 'center',
          '& .MuiAlert-message': {
            flex: 1
          }
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              startIcon={<GetApp />}
              onClick={handleInstall}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Install App
            </Button>
            <IconButton
              size="small"
              color="inherit"
              onClick={handleDismiss}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        Add PGFlow to your home screen for quick access!
      </Alert>
    </Snackbar>
  );
};

export default ManualInstallPrompt;
