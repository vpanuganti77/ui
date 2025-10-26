import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  MenuItem
} from '@mui/material';
import { create } from '../services/fileDataService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


interface ContactUsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ContactUsDialog: React.FC<ContactUsDialogProps> = ({ open, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hostelName: '',
    address: '',
    planType: 'free_trial',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!/^\d{10}$/.test(formData.phone)) return 'Phone must be 10 digits';
    if (!formData.hostelName.trim()) return 'Hostel name is required';
    if (!formData.address.trim()) return 'Address is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create unique hostel request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create hostel request with user data
      const request = {
        id: requestId,
        ...formData,
        status: 'pending',
        isRead: false,
        submittedAt: new Date().toISOString(),
        tempPassword // Store temp password for auto-login
      };

      const hostelRequest = await create('hostelRequests', request);
      
      // Generate hostel domain email
      const hostelDomain = formData.hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const username = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const hostelEmail = `${username}@${hostelDomain}`;
      
      // Create user account immediately with unique ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        name: formData.name,
        email: hostelEmail, // Use hostel domain email
        originalEmail: formData.email, // Store original email for reference
        password: tempPassword,
        phone: formData.phone,
        role: 'admin',
        hostelName: formData.hostelName,
        hostelId: null, // Will be set when hostel is approved
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        requestId: requestId
      };
      
      const createdUser = await create('users', userData);
      
      // Create notifications for all master admin users
      try {
        const { getAll } = await import('../services/fileDataService');
        const allUsers = await getAll('users');
        const masterAdmins = allUsers.filter((user: any) => user.role === 'masterAdmin');
        
        // Create notification for each master admin (exclude the requesting user)
        for (const masterAdmin of masterAdmins) {
          // Skip if this master admin is the same as the requesting user
          if (masterAdmin.email === hostelEmail || masterAdmin.originalEmail === formData.email) {
            continue;
          }
          
          const masterAdminNotification = {
            id: `${Date.now()}_${masterAdmin.id}_request`,
            type: 'hostel_request',
            title: 'New Hostel Setup Request',
            message: `${formData.name} has requested to setup ${formData.hostelName}. Please review and approve.`,
            userId: masterAdmin.id,
            hostelId: requestId,
            priority: 'high',
            isRead: false,
            createdAt: new Date().toISOString(),
            createdBy: formData.name
          };
          
          await create('notifications', masterAdminNotification);
          console.log('Created notification for master admin:', masterAdmin.name);
        }
        
        // Send push notification to master admins
        const { NotificationService } = await import('../services/notificationService');
        await NotificationService.sendPushNotification(
          'masterAdmin',
          'New Hostel Setup Request',
          `${formData.name} has requested to setup ${formData.hostelName}. Please review and approve.`,
          'hostel_request'
        );
        
        // Trigger notification refresh for all users
        window.dispatchEvent(new CustomEvent('notificationRefresh'));
      } catch (notificationError) {
        console.error('Failed to create master admin notifications:', notificationError);
      }
      
      // Don't send notification to the requesting user - they should not get their own request notification
      setSuccess(true);
      
      setTimeout(async () => {
        try {
          console.log('Attempting auto-login with:', hostelEmail, tempPassword);
          await login(hostelEmail, tempPassword);
          console.log('Auto-login successful, navigating to dashboard');
          onClose();
          navigate('/admin/dashboard');
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          console.error('Login error details:', loginError);
          // Stay on current page and show error instead of redirecting to login
          setError('Auto-login failed. Please try logging in manually.');
          setSuccess(false);
          setIsSubmitting(false);
        }
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={success ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Setup Your Hostel</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {success ? (
            <Alert severity="success" sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  border: '4px solid #e0e0e0', 
                  borderTop: '4px solid #4caf50', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  🎉 Hostel Setup Complete!
                </Typography>
                <Typography variant="body2">
                  Your account has been created successfully. Redirecting to dashboard...
                </Typography>
              </Box>
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Get started with your hostel management system in minutes.
              </Typography>
              
              <TextField
                label="Your Name"
                value={formData.name}
                onChange={handleChange('name')}
                fullWidth
                size="small"
              />
              
              <TextField
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                size="small"
              />
              
              <TextField
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                fullWidth
                size="small"
              />
              
              <TextField
                label="Hostel Name"
                value={formData.hostelName}
                onChange={handleChange('hostelName')}
                fullWidth
                size="small"
              />
              
              <TextField
                label="Hostel Address"
                value={formData.address}
                onChange={handleChange('address')}
                fullWidth
                size="small"
              />
              
              <TextField
                label="Plan"
                value="Free Trial - 30 Days"
                disabled
                fullWidth
                size="small"
              />
              
              <TextField
                label="Message (Optional)"
                value={formData.message}
                onChange={handleChange('message')}
                multiline
                rows={2}
                fullWidth
                size="small"
                placeholder="Any specific requirements or questions?"
              />
            </Box>
            </>
          )}
        </DialogContent>
        {!success && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : 'Get Started'}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
};

export default ContactUsDialog;