import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Fingerprint,
  Face,
  Pin,
  Close,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { BiometricService } from '../services/biometricService';

interface QuickAuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthenticate: (email: string, password: string) => Promise<void>;
}

const QuickAuthDialog: React.FC<QuickAuthDialogProps> = ({
  open,
  onClose,
  onAuthenticate
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available && BiometricService.isBiometricEnabled());
    };
    checkBiometric();
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await BiometricService.authenticateBiometric();
      if (result.success && result.credentials) {
        await onAuthenticate(result.credentials.email, result.credentials.password);
        onClose();
      } else {
        setError('Biometric authentication failed');
      }
    } catch (err) {
      setError('Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePinAuth = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting PIN auth with:', pin);
      const credentials = BiometricService.verifyPIN(pin);
      console.log('PIN verification result:', credentials);
      
      if (credentials) {
        console.log('Authenticating with credentials:', credentials);
        await onAuthenticate(credentials.email, credentials.password);
        onClose();
        setPin('');
      } else {
        setError('Invalid PIN');
      }
    } catch (err) {
      console.error('PIN authentication error:', err);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      setError('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Quick Login
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use biometric authentication or PIN for quick access
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Biometric Authentication */}
          {biometricAvailable && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<Fingerprint />}
                onClick={handleBiometricAuth}
                disabled={loading}
                sx={{ 
                  py: 2, 
                  mb: 1,
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#45a049',
                    backgroundColor: 'rgba(76, 175, 80, 0.04)'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Use Fingerprint'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<Face />}
                onClick={handleBiometricAuth}
                disabled={loading}
                sx={{ 
                  py: 2,
                  borderColor: '#2196f3',
                  color: '#2196f3',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Use Face ID'}
              </Button>
            </Box>
          )}

          {/* PIN Authentication */}
          {BiometricService.isPINSet() && (
            <>
              {biometricAvailable && <Divider sx={{ my: 2 }}>OR</Divider>}
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pin sx={{ mr: 1 }} />
                  Enter your 4-digit PIN
                </Typography>
                
                <TextField
                  fullWidth
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  inputProps={{
                    maxLength: 4,
                    style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowPin(!showPin)} edge="end">
                        {showPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePinAuth}
                  disabled={pin.length !== 4 || loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Authenticate'}
                </Button>
              </Box>
            </>
          )}

          {!biometricAvailable && !BiometricService.isPINSet() && (
            <Typography variant="body2" color="text.secondary">
              No quick authentication methods available.
              Set up biometric or PIN authentication in your profile.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAuthDialog;