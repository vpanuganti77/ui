import React, { useState, useEffect } from 'react';
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
import { getAll, create } from '../../services/fileDataService';

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
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const rooms = await getAll('rooms');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const hostelRooms = rooms.filter((room: any) => 
          room.hostelId === user.hostelId || 
          !room.hostelId || 
          room.hostelId === ''
        );
        const availableRooms = hostelRooms.filter((room: any) => room.status === 'available');
        
        setAvailableRooms(availableRooms);
      } catch (error) {
        console.error('Failed to load rooms:', error);
        setError('Failed to load available rooms');
      } finally {
        setLoading(false);
      }
    };
    
    loadRooms();
  }, []);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!/^\d{10}$/.test(formData.phone)) return 'Phone must be 10 digits';
    if (!formData.gender) return 'Gender is required';
    if (!formData.roomId) return 'Room selection is required';
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
      
      // Create user account
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      await create('users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'tenant',
        hostelId: user?.hostelId || ''
      });
      
      setSuccess('Tenant and user account created successfully!');
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
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create tenant');
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
        {availableRooms.length === 0 && !loading && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No available rooms found. Please create rooms in the Rooms section before adding tenants.
          </Alert>
        )}

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
            <FormControl fullWidth>
              <InputLabel>Select Room</InputLabel>
              <Select
                value={formData.roomId}
                onChange={(e) => {
                  const selectedRoom = availableRooms.find(room => room.roomNumber === e.target.value);
                  setFormData({
                    ...formData, 
                    roomId: e.target.value,
                    rent: selectedRoom?.rent || 0
                  });
                }}
                disabled={loading || availableRooms.length === 0}
              >
                {availableRooms.length === 0 ? (
                  <MenuItem disabled value="">
                    {loading ? 'Loading rooms...' : 'No available rooms found. Please create rooms first.'}
                  </MenuItem>
                ) : (
                  availableRooms.map((room) => (
                    <MenuItem key={room.roomNumber} value={room.roomNumber}>
                      {room.roomNumber} - {room.type} (₹{room.rent.toLocaleString()}) - Available
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Monthly Rent"
              type="number"
              value={formData.rent}
              onChange={(e) => setFormData({...formData, rent: Number(e.target.value)})}
              disabled
              helperText="Auto-filled when room is selected"
            />
            <TextField
              fullWidth
              label="Security Deposit"
              type="number"
              value={formData.deposit}
              onChange={(e) => setFormData({...formData, deposit: Number(e.target.value)})}
            />
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
            disabled={loading || availableRooms.length === 0}
          >
            Create Tenant Account
          </Button>
          {availableRooms.length === 0 && !loading && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 2, textAlign: 'center' }}>
              No available rooms found. Please create rooms in the Rooms section first.
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTenant;