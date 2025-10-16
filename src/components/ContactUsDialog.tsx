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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fill out this form and we'll help you set up your hostel management system.
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Your Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  required
                  fullWidth
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="Hostel Name"
                  value={formData.hostelName}
                  onChange={handleChange('hostelName')}
                  required
                  fullWidth
                  size="small"
                />
              </Box>
              
              <TextField
                label="Hostel Address"
                value={formData.address}
                onChange={handleChange('address')}
                required
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