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

interface ContactUsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ContactUsDialog: React.FC<ContactUsDialogProps> = ({ open, onClose }) => {
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
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      const request = {
        ...formData,
        status: 'pending',
        isRead: false,
        submittedAt: new Date().toISOString()
      };

      await create('hostelRequests', request);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          hostelName: '',
          address: '',
          planType: 'free_trial',
          message: ''
        });
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Setup Your Hostel</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {success ? (
            <Alert severity="success">
              Request submitted successfully! We'll contact you soon.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fill out this form and we'll help you set up your hostel management system.
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Your Name"
                  value={formData.name}
                  onChange={handleChange('name')}
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
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
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
              </Box>
              
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
              />
            </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {!success && (
            <Button type="submit" variant="contained">
              Submit Request
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactUsDialog;