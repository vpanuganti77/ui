import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'tenant',
    password: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    // Get current user role
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserRole(user.role || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    if (open) {
      if (editingItem) {
        setFormData({
          name: editingItem.name || '',
          phone: editingItem.phone || '',
          role: editingItem.role || 'tenant',
          password: ''
        });
        setGeneratedEmail(editingItem.email || '');
      } else {
        setFormData({
          name: '',
          phone: '',
          role: 'tenant',
          password: ''
        });
        setGeneratedEmail('');
      }
    }
  }, [open, editingItem]);

  useEffect(() => {
    if (formData.name && !editingItem) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const hostelName = user.hostelName || '';
          const hostelDomain = hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
          const username = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          setGeneratedEmail(`${username}@${hostelDomain}`);
        } catch (error) {
          console.error('Error generating email:', error);
        }
      }
    }
  }, [formData.name, editingItem]);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingItem ? 'Edit User' : 'Add New User'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />
          
          {!editingItem && generatedEmail && (
            <Alert severity="info" sx={{ mb: 1 }}>
              Email will be auto-generated as: <strong>{generatedEmail}</strong>
            </Alert>
          )}
          
          {editingItem && (
            <TextField
              label="Email"
              value={generatedEmail}
              disabled
              fullWidth
              helperText="Email cannot be changed after creation"
            />
          )}
          
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            fullWidth
          />
          
          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              {currentUserRole === 'master_admin' && (
                <MenuItem value="master_admin">Master Admin</MenuItem>
              )}
              {(currentUserRole === 'admin' || currentUserRole === 'master_admin') && (
                <MenuItem value="admin">Admin</MenuItem>
              )}
              {(currentUserRole === 'admin' || currentUserRole === 'master_admin') && (
                <MenuItem value="receptionist">Receptionist</MenuItem>
              )}
              <MenuItem value="tenant">Tenant</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label={editingItem ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingItem}
            fullWidth
            helperText={!editingItem ? "Default password will be 'user123' if left blank" : ""}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || !formData.phone}
        >
          {editingItem ? 'Update' : 'Create'} User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;