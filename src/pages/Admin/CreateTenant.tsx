import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { adminService } from '../../services/adminService';

const CreateTenant: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roomId: '',
    rent: 0,
    deposit: 0,
    gender: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!/^\d{10}$/.test(formData.phone)) return 'Phone must be 10 digits';
    if (!formData.gender) return 'Gender is required';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await adminService.createTenant(formData);
      setSuccess('Tenant created successfully! Credentials sent to tenant.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        roomId: '',
        rent: 0,
        deposit: 0,
        gender: '',
        joiningDate: new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Tenant
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Temporary Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              helperText="Tenant should change this on first login"
            />
          </Stack>
          
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Create Tenant Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTenant;