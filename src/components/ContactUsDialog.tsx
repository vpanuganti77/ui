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
      
      // Create user account immediately with unique ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        name: formData.name,
        email: formData.email,
        password: tempPassword,
        phone: formData.phone,
        role: 'admin',
        hostelName: formData.hostelName,
        hostelId: requestId, // Use request ID as temporary hostel ID
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        requestId: requestId
      };
      
      const createdUser = await create('users', userData);
      
      // Store user data in localStorage for auto-login
      const userForStorage = {
        ...userData,
        id: createdUser.id || userId,
        isAuthenticated: true
      };
      
      localStorage.setItem('user', JSON.stringify(userForStorage));
      localStorage.setItem('token', 'temp_token_' + Date.now());
      
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        navigate('/admin/dashboard');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Setup Your Hostel</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {success ? (
            <Alert severity="success">
              Account created successfully! Redirecting to your dashboard...
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
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {!success && (
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : 'Get Started'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactUsDialog;