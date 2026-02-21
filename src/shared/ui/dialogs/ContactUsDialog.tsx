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
import { create, getAll } from '../../../shared/services/storage/fileDataService';
import { useAuth } from '../../../context/AuthContext';
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
  const [loginCredentials, setLoginCredentials] = useState<any>(null);

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
      // Create unique hostel request ID using timestamp only
      const requestId = Date.now().toString();
      
      // Create hostel request with user data
      const request = {
        id: requestId,
        ...formData,
        status: 'pending',
        isRead: false,
        submittedAt: new Date().toISOString()
      };

      const hostelRequest = await create('hostelRequests', request);
      
      // Store login credentials if provided
      if (hostelRequest.userCredentials) {
        setLoginCredentials(hostelRequest.userCredentials);
        
        // Auto-login the user
        try {
          await login(hostelRequest.userCredentials.email, hostelRequest.userCredentials.password);
          console.log('Auto-login successful');
          // Close dialog and navigate to dashboard
          setTimeout(() => {
            onClose();
            navigate('/admin/dashboard');
          }, 3000);
          return; // Skip the manual redirect
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          // Continue with manual login flow
        }
      }
      
      // Create notifications for all master admin users
      try {
        const allUsers = await getAll('users');
        const masterAdmins = allUsers.filter((user: any) => user.role === 'master_admin');
        
        // Create notification for each master admin
        for (const masterAdmin of masterAdmins) {
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
        const { NotificationService } = await import('../../../features/notifications/services/notificationService');
        await NotificationService.sendPushNotification(
          'master_admin',
          'New Hostel Setup Request',
          `${formData.name} has requested to setup ${formData.hostelName}. Please review and approve.`,
          'hostel_request'
        );
        
        // Trigger notification refresh for all users
        window.dispatchEvent(new CustomEvent('notificationRefresh'));
      } catch (notificationError) {
        console.error('Failed to create master admin notifications:', notificationError);
      }
      
      setSuccess(true);
      
      // Only redirect to login if auto-login didn't work
      if (!loginCredentials) {
        setTimeout(() => {
          onClose();
          navigate('/login?setupComplete=true');
        }, 5000);
      }
      
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
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  🎉 Hostel Setup Complete!
                </Typography>
                <Typography variant="body2">
                  Your hostel and admin account have been created. You can now login with the credentials below:
                </Typography>
                
                {loginCredentials && (
                  <Box sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2, 
                    borderRadius: 1, 
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Your Login Credentials:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                      <strong>Email:</strong> {loginCredentials.email}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      <strong>Password:</strong> {loginCredentials.password}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Please save these credentials. Your hostel is pending approval by our admin team.
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {loginCredentials ? 'Logging you in automatically...' : 'Redirecting to login page in 5 seconds...'}
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
