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
  Tabs,
  Tab,
} from '@mui/material';
import ComplaintComments from './ComplaintComments';

interface AdminComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
  openToComments?: boolean;
}

const AdminComplaintDialog: React.FC<AdminComplaintDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem,
  openToComments = false
}) => {
  const [formData, setFormData] = useState({
    status: 'open',
    assignedTo: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const loadComplaintData = async () => {
      if (editingItem) {
        // Fetch latest complaint data
        try {
          const { getAll } = await import('../services/fileDataService');
          const complaints = await getAll('complaints');
          const latestComplaint = complaints.find((c: any) => c.id === editingItem.id);
          
          if (latestComplaint) {
            setFormData({
              status: latestComplaint.status || 'open',
              assignedTo: latestComplaint.assignedTo || ''
            });
            setComments(latestComplaint.comments || []);
          } else {
            setFormData({
              status: editingItem.status || 'open',
              assignedTo: editingItem.assignedTo || ''
            });
            setComments(editingItem.comments || []);
          }
        } catch (error) {
          console.error('Error loading latest complaint data:', error);
          setFormData({
            status: editingItem.status || 'open',
            assignedTo: editingItem.assignedTo || ''
          });
          setComments(editingItem.comments || []);
        }
      } else {
        setFormData({
          status: 'open',
          assignedTo: ''
        });
        setComments([]);
      }
      
      // Set tab based on openToComments prop
      setTabValue(openToComments ? 1 : 0);
    };
    
    if (open) {
      loadComplaintData();
    }
  }, [editingItem, open, openToComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };
  
  const handleAddComment = async (comment: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api'}/complaints/${editingItem.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment,
          author: user.name,
          role: user.role
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const result = await response.json();
      setComments(result.complaint.comments || []);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'reopen': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getAvailableStatuses = () => {
    const allStatuses = [
      { value: 'open', label: 'Open' },
      { value: 'reopen', label: 'Reopened' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' },
      { value: 'duplicate', label: 'Duplicate' }
    ];
    
    // If complaint is resolved, admin cannot change status (only tenant can reopen)
    if (editingItem && editingItem.status === 'resolved') {
      return [{ value: 'resolved', label: 'Resolved (Only tenant can reopen)' }];
    }
    
    // Prevent reverting from in-progress to open
    if (editingItem && editingItem.status === 'in-progress') {
      return allStatuses.filter(status => status.value !== 'open');
    }
    
    // Prevent reverting from reopen to open
    if (editingItem && editingItem.status === 'reopen') {
      return allStatuses.filter(status => status.value !== 'open');
    }
    
    // If current status is not 'open' or 'reopen', exclude 'open' from options
    if (editingItem && editingItem.status !== 'open' && editingItem.status !== 'reopen') {
      return allStatuses.filter(status => status.value !== 'open');
    }
    
    return allStatuses;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingItem ? 'Complaint Details' : 'Complaint Details'}
      </DialogTitle>
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
              <Chip 
                label={editingItem.status} 
                size="small" 
                color={getStatusColor(editingItem.status) as any}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Submitted: {new Date(editingItem.createdAt).toLocaleString()}
              </Typography>
              {editingItem.updatedAt && editingItem.updatedAt !== editingItem.createdAt && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  Last Updated: {new Date(editingItem.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="Update Status" />
          <Tab label={`Comments (${comments.length})`} />
        </Tabs>
        
        {tabValue === 0 && (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={editingItem && editingItem.status === 'resolved'}
                >
                  {getAvailableStatuses().map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="e.g., Maintenance Team, John Doe"
                fullWidth
                disabled={editingItem && editingItem.status === 'resolved'}
              />
            </Box>
          </form>
        )}
        
        {tabValue === 1 && editingItem && (
          <ComplaintComments
            complaintId={editingItem.id}
            comments={comments}
            onAddComment={handleAddComment}
            currentUser={{
              name: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin',
              role: 'admin'
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {tabValue === 0 && (
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={editingItem && editingItem.status === 'resolved'}
          >
            {editingItem && editingItem.status === 'resolved' ? 'Complaint Resolved' : 'Update Complaint'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminComplaintDialog;