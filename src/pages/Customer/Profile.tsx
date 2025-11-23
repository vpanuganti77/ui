import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Edit, Save, Cancel, Person, Email, Phone, Business, Badge, VpnKey, Visibility, VisibilityOff, Hotel, Fingerprint } from '@mui/icons-material';
import { update } from '../../services/fileDataService';
import BiometricSetupDialog from '../../components/BiometricSetupDialog';
import { BiometricService } from '../../services/biometricService';
import { useAuth } from '../../context/AuthContext';
import { FEATURE_FLAGS } from '../../config/features';

const Profile: React.FC = () => {
  const { clearQuickAuth } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [biometricSetupOpen, setBiometricSetupOpen] = useState(false);
  const [quickAuthEnabled, setQuickAuthEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || ''
      });
    }
    setQuickAuthEnabled(BiometricService.isPINSet());
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  const handleSave = async () => {
    try {
      const updatedUser = await update('users', user.id, formData);
      
      // Update localStorage
      const updatedUserData = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      
      setEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match', severity: 'error' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters', severity: 'error' });
      return;
    }
    
    try {
      // Validate current password first
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://hostelmanagementbackend-production.up.railway.app/api'}/auth/validate-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          currentPassword: passwordData.currentPassword 
        })
      });
      
      if (!response.ok) {
        setSnackbar({ open: true, message: 'Current password is incorrect', severity: 'error' });
        return;
      }
      
      // Update password
      const updateResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://hostelmanagementbackend-production.up.railway.app/api'}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          newPassword: passwordData.newPassword 
        })
      });
      
      if (!updateResponse.ok) {
        setSnackbar({ open: true, message: 'Failed to update password', severity: 'error' });
        return;
      }
      
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSnackbar({ open: true, message: 'Password changed successfully! Please login again.', severity: 'success' });
      
      // Logout and redirect to login after 2 seconds
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to change password', severity: 'error' });
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          My Profile
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<VpnKey />}
            onClick={() => setPasswordDialog(true)}
            size="small"
          >
            Change Password
          </Button>
          {FEATURE_FLAGS.QUICK_AUTH_ENABLED && (
            <Button
              variant="outlined"
              startIcon={<Fingerprint />}
              onClick={() => setBiometricSetupOpen(true)}
              size="small"
            >
              {quickAuthEnabled ? 'Manage' : 'Setup'} Quick Auth
            </Button>
          )}
          <Button
            variant={editing ? "outlined" : "contained"}
            startIcon={editing ? <Cancel /> : <Edit />}
            onClick={editing ? handleCancel : handleEdit}
            size="small"
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </Box>
      </Box>

      {/* Profile Header Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Avatar
              sx={{
                width: { xs: 70, md: 80 },
                height: { xs: 70, md: 80 },
                bgcolor: 'success.main',
                fontSize: { xs: '1.8rem', md: '2rem' }
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || 'T'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {user.hostelName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Chip
                  label="Tenant"
                  color="success"
                  icon={<Badge />}
                  size="small"
                />
                <Chip
                  label={user.status === 'active' ? 'Active' : 'Inactive'}
                  color={user.status === 'active' ? 'success' : 'error'}
                  size="small"
                />
                {user.room && (
                  <Chip
                    label={`Room ${user.room}`}
                    color="primary"
                    icon={<Hotel />}
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Authentication */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Fingerprint sx={{ mr: 1 }} />
            Quick Authentication
          </Typography>
          
          {quickAuthEnabled ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Quick authentication is enabled. You can use PIN or biometric login.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Set up PIN or biometric authentication for faster login.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {BiometricService.isPINSet() && (
              <Chip label="PIN Enabled" color="success" variant="outlined" size="small" />
            )}
            {BiometricService.isBiometricEnabled() && (
              <Chip label="Biometric Enabled" color="success" variant="outlined" size="small" />
            )}
          </Box>
          
          {quickAuthEnabled && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                clearQuickAuth();
                setQuickAuthEnabled(false);
                setSnackbar({ open: true, message: 'Quick authentication disabled', severity: 'success' });
              }}
              size="small"
            >
              Disable Quick Auth
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Personal Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Person sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.name}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Email sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Email Address
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    size="small"
                    type="email"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.phone || 'Not provided'}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Business sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Hostel
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.hostelName}
                </Typography>
              </Box>
            </Box>

            {user.room && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Hotel sx={{ color: 'primary.main', fontSize: 20 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Room Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.room}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {editing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                size="small"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                size="small"
              >
                Save
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              fullWidth
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
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {FEATURE_FLAGS.QUICK_AUTH_ENABLED && (
        <BiometricSetupDialog
          open={biometricSetupOpen}
          onClose={() => setBiometricSetupOpen(false)}
          userEmail={user?.email || ''}
          onSetupComplete={() => {
            setQuickAuthEnabled(true);
            setSnackbar({ open: true, message: 'Quick authentication setup complete!', severity: 'success' });
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;