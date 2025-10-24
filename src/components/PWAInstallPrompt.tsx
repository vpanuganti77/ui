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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close, GetApp, PhoneIphone } from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Check if app was launched from home screen
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show install prompt on mobile if conditions are met
    if (isMobile && !isStandalone) {
      const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
      const isPWAInstalled = localStorage.getItem('pwa-installed');
      
      if (!hasShownPrompt && !isPWAInstalled) {
        // Show prompt after 3 seconds, even without beforeinstallprompt event
        const timer = setTimeout(() => {
          console.log('Showing install prompt after timeout');
          setShowInstallPrompt(true);
        }, 3000);
        
        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
        };
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile, isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Use native install prompt if available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      }
      
      setDeferredPrompt(null);
    } else {
      // Show manual install instructions for browsers that don't support beforeinstallprompt
      showManualInstallInstructions();
    }
    
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    setShowInstallPrompt(false);
  };
  
  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    if (isIOS) {
      instructions = 'Tap the Share button and then "Add to Home Screen"';
    } else if (isAndroid) {
      instructions = 'Tap the menu (⋮) and select "Add to Home screen" or "Install app"';
    } else {
      instructions = 'Look for "Add to Home Screen" or "Install" option in your browser menu';
    }
    
    alert(`To install PGFlow:\n\n${instructions}`);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    setShowInstallPrompt(false);
  };

  // Don't show if not mobile, already installed, or prompt not requested
  if (!isMobile || isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <Dialog 
      open={showInstallPrompt} 
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
              Install PGFlow App
            </Typography>
          </Box>
          <IconButton onClick={handleDismiss} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Add PGFlow to your home screen for quick and easy access!
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'primary.50', 
          p: 2, 
          borderRadius: 2, 
          border: '1px solid',
          borderColor: 'primary.200'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Benefits:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
            <li>Faster loading and offline access</li>
            <li>Native app-like experience</li>
            <li>Easy access from home screen</li>
            <li>Push notifications support</li>
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleDismiss} color="inherit">
          Maybe Later
        </Button>
        <Button 
          onClick={handleInstallClick} 
          variant="contained" 
          startIcon={<GetApp />}
          sx={{ minWidth: 120 }}
        >
          Install App
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt;