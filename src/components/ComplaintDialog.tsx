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
} from '@mui/material';
import { getAll } from '../services/fileDataService';
import { triggerNotificationRefresh } from '../utils/notificationTrigger';

interface ComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const ComplaintDialog: React.FC<ComplaintDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    tenantName: '',
    tenantPhone: '',
    room: ''
  });
  const [currentTenant, setCurrentTenant] = useState<any>(null);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setFormData({
          title: editingItem.title || '',
          description: editingItem.description || '',
          category: editingItem.category || '',
          priority: editingItem.priority || 'medium',
          tenantName: editingItem.tenantName || '',
          tenantPhone: editingItem.tenantPhone || '',
          room: editingItem.room || ''
        });
      } else {
        // Auto-populate tenant details for new complaints
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.role === 'tenant') {
              loadTenantDetails(user.email);
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
        
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'medium',
          tenantName: '',
          tenantPhone: '',
          room: ''
        });
      }
    }
  }, [open, editingItem]);

  const loadTenantDetails = async (email: string) => {
    try {
      const tenants = await getAll('tenants');
      const tenant = tenants.find((t: any) => t.email === email);
      if (tenant) {
        setCurrentTenant(tenant);
        setFormData(prev => ({
          ...prev,
          tenantName: tenant.name,
          tenantPhone: tenant.phone,
          room: tenant.room
        }));
      }
    } catch (error) {
      console.error('Error loading tenant details:', error);
    }
  };

  const handleSubmit = async () => {
    const userData = localStorage.getItem('user');
    let tenantId = '';
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
        if (user.role === 'tenant' && currentTenant) {
          tenantId = currentTenant.id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const submitData = {
      ...formData,
      tenantId,
      status: editingItem ? editingItem.status : 'open'
    };

    onSubmit(submitData);
    
    // Send notification for new complaint
    if (!editingItem && user) {
      try {
        const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ API_BASE_URL: 'http://192.168.0.138:5000/api' }));
        const apiBaseUrl = config.API_BASE_URL || 'http://192.168.0.138:5000/api';
        
        await fetch(`${apiBaseUrl}/notifications/complaint-created`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaintTitle: formData.title,
            complaintCategory: formData.category,
            priority: formData.priority,
            tenantName: formData.tenantName,
            room: formData.room,
            hostelId: user.hostelId
          })
        });
      } catch (notificationError) {
        console.warn('Failed to send new complaint notification:', notificationError);
      }
    }
    
    triggerNotificationRefresh();
    onClose();
  };

  const isRoomRelated = ['maintenance', 'cleaning', 'facilities'].includes(formData.category);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingItem ? 'Edit Complaint' : 'Submit New Complaint'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            fullWidth
          />
          
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            required
            fullWidth
          />
          
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="cleaning">Cleaning</MenuItem>
              <MenuItem value="facilities">Facilities</MenuItem>
              <MenuItem value="noise">Noise</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Your Name"
            value={formData.tenantName}
            disabled
            fullWidth
          />
          
          <TextField
            label="Your Phone"
            value={formData.tenantPhone}
            disabled
            fullWidth
          />
          
          <TextField
            label="Room"
            value={formData.room}
            disabled={isRoomRelated}
            onChange={!isRoomRelated ? (e) => setFormData({ ...formData, room: e.target.value }) : undefined}
            fullWidth
            helperText={isRoomRelated ? "Room is auto-filled for room-related complaints" : "Leave empty if not room-specific"}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.title || !formData.description || !formData.category}
        >
          {editingItem ? 'Update' : 'Submit'} Complaint
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComplaintDialog;