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
  Chip,
} from '@mui/material';

interface AdminComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const AdminComplaintDialog: React.FC<AdminComplaintDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    status: 'open',
    adminNotes: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        status: editingItem.status || 'open',
        adminNotes: editingItem.adminNotes || '',
        assignedTo: editingItem.assignedTo || ''
      });
    } else {
      setFormData({
        status: 'open',
        adminNotes: '',
        assignedTo: ''
      });
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingItem ? 'Update Complaint Status' : 'Complaint Details'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {editingItem && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>{editingItem.title}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {editingItem.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={editingItem.category} size="small" />
                <Chip label={editingItem.priority} size="small" />
                <Chip label={`Room ${editingItem.room}`} size="small" />
                <Chip label={editingItem.tenantName} size="small" />
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="duplicate">Duplicate</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="e.g., Maintenance Team, John Doe"
              fullWidth
            />

            <TextField
              label="Admin Notes"
              multiline
              rows={4}
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              placeholder="Add notes about the complaint resolution..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Update Complaint
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminComplaintDialog;