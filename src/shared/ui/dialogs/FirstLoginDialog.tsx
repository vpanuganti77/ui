import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { VpnKey, Visibility, VisibilityOff } from '@mui/icons-material';
import { update } from '../../../shared/services/storage/fileDataService';

interface FirstLoginDialogProps {
  open: boolean;
  user: any;
  onComplete: () => void;
}

const FirstLoginDialog: React.FC<FirstLoginDialogProps> = ({ open, user, onComplete }) => {
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await update('users', user.id, { 
        ...user, 
        password: passwordData.newPassword,
        firstLogin: false
      });
      
      // Update localStorage
      const updatedUser = { ...user, firstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      onComplete();
    } catch (error) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <VpnKey color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Change Your Password
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          For security reasons, you must change your password before continuing
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          This is your first login. Please create a new secure password to protect your account.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            fullWidth
            helperText="Minimum 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleChangePassword} 
          variant="contained"
          fullWidth
          disabled={!passwordData.newPassword || !passwordData.confirmPassword || loading}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Updating Password...' : 'Set New Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FirstLoginDialog;
