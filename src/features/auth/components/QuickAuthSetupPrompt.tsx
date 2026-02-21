import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Fingerprint, Security } from '@mui/icons-material';
import { BiometricService } from '../services/biometricService';
import BiometricSetupDialog from './BiometricSetupDialog';

interface QuickAuthSetupPromptProps {
  user: any;
  onComplete: () => void;
}

const QuickAuthSetupPrompt: React.FC<QuickAuthSetupPromptProps> = ({ user, onComplete }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const shouldPrompt = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      if (!isMobile) return false;
      if (BiometricService.isPINSet()) return false;
      
      const dismissed = localStorage.getItem(`quickauth_dismissed_${user?.id}`);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (dismissedTime > dayAgo) return false;
      }
      
      return true;
    };

    if (user && shouldPrompt()) {
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [user, onComplete]);

  return (
    <>
      <Dialog open={showPrompt} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1, color: 'primary.main' }} />
          Setup Quick Authentication
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Fingerprint sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Make login faster and more secure
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up PIN or biometric authentication for faster mobile login access.
            </Typography>
            
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              • Quick access with 4-digit PIN<br/>
              • Fingerprint or Face ID support<br/>
              • Secure credential encryption<br/>
              • 24-hour persistent sessions
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              localStorage.setItem(`quickauth_dismissed_${user?.id}`, Date.now().toString());
              setShowPrompt(false);
              onComplete();
            }} 
            color="inherit"
          >
            Maybe Later
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowPrompt(false);
              setShowSetup(true);
            }}
            startIcon={<Fingerprint />}
          >
            Setup Now
          </Button>
        </DialogActions>
      </Dialog>

      <BiometricSetupDialog
        open={showSetup}
        onClose={() => setShowSetup(false)}
        userEmail={user?.email || ''}
        onSetupComplete={() => {
          setShowSetup(false);
          onComplete();
        }}
      />
    </>
  );
};

export default QuickAuthSetupPrompt;
