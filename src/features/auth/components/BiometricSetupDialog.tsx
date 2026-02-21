import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Fingerprint,
  Security,
  CheckCircle,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { BiometricService } from '../services/biometricService';

interface BiometricSetupDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  onSetupComplete: () => void;
}

const BiometricSetupDialog: React.FC<BiometricSetupDialogProps> = ({
  open,
  onClose,
  userEmail,
  onSetupComplete
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['Set PIN', 'Verify Password', 'Setup Biometric'];

  const handlePinSetup = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    setError('');
    setActiveStep(1);
  };

  const handlePasswordVerify = () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    setError('');
    setActiveStep(2);
  };

  const handleBiometricSetup = async () => {
    setLoading(true);
    setError('');

    try {
      // Store credentials with PIN
      BiometricService.setPIN(pin, { email: userEmail, password });
      
      // Setup biometric if available
      const biometricAvailable = await BiometricService.isAvailable();
      if (biometricAvailable) {
        const success = await BiometricService.registerBiometric(userEmail);
        if (!success) {
          setError('Biometric setup failed, but PIN is saved');
        }
      }

      onSetupComplete();
      onClose();
      resetForm();
    } catch (err) {
      setError('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setPin('');
    setConfirmPin('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePinChange = (value: string, isConfirm = false) => {
    if (/^\d{0,4}$/.test(value)) {
      if (isConfirm) {
        setConfirmPin(value);
      } else {
        setPin(value);
      }
      setError('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1, color: 'primary.main' }} />
          Setup Quick Authentication
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: PIN Setup */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create a 4-digit PIN
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This PIN will be used for quick authentication
            </Typography>

            <TextField
              fullWidth
              label="Enter PIN"
              type="password"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              inputProps={{
                maxLength: 4,
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3rem' }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirm PIN"
              type="password"
              value={confirmPin}
              onChange={(e) => handlePinChange(e.target.value, true)}
              placeholder="••••"
              inputProps={{
                maxLength: 4,
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3rem' }
              }}
            />
          </Box>
        )}

        {/* Step 2: Password Verification */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify your password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your current password to secure your credentials
            </Typography>

            <TextField
              fullWidth
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )}

        {/* Step 3: Biometric Setup */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Fingerprint sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Setup Biometric Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use your fingerprint or face ID for secure and quick access
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Your PIN has been saved. Biometric authentication is optional but recommended for enhanced security.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        
        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handlePinSetup}
            disabled={pin.length !== 4 || confirmPin.length !== 4}
          >
            Next
          </Button>
        )}

        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handlePasswordVerify}
            disabled={!password.trim()}
          >
            Next
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleBiometricSetup}
            disabled={loading}
            startIcon={loading ? undefined : <CheckCircle />}
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BiometricSetupDialog;
