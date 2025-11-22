import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fab,
  IconButton,
} from '@mui/material';
import { Add, Comment, Inbox, AttachFile, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';
import TenantComplaintDialog from '../../components/TenantComplaintDialog';

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { notifications: contextNotifications } = useNotifications();
  
  // Auto-refresh complaints when complaint notifications are received
  useEffect(() => {
    const complaintNotifications = contextNotifications.filter(n => 
      n.type === 'complaint_update' && !n.isRead
    );
    
    if (complaintNotifications.length > 0) {
      const refreshComplaints = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const { getAll } = await import('../../services/fileDataService');
          const tenants = await getAll('tenants');
          const tenant = tenants.find((t: any) => 
            t.email === user.email || t.name === user.name ||
            t.email?.toLowerCase() === user.email?.toLowerCase()
          );
          
          if (tenant) {
            const allComplaints = await getAll('complaints');
            const tenantComplaints = allComplaints.filter((c: any) => 
              c.tenantId === tenant.id || c.tenantName === tenant.name
            );
            setComplaints(tenantComplaints);
            setRefreshKey(prev => prev + 1);
          }
        } catch (error) {
          console.error('Error refreshing complaints:', error);
        }
      };
      
      refreshComplaints();
    }
  }, [contextNotifications]);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { getAll } = await import('../../services/fileDataService');
        
        // Get tenant data
        const tenants = await getAll('tenants');
        console.log('User:', user);
        console.log('All tenants:', tenants);
        const tenant = tenants.find((t: any) => 
          t.email === user.email || 
          t.name === user.name ||
          t.email?.toLowerCase() === user.email?.toLowerCase()
        );
        console.log('Found tenant:', tenant);
        
        if (tenant) {
          // Get complaints for this tenant
          const allComplaints = await getAll('complaints');
          const tenantComplaints = allComplaints.filter((c: any) => c.tenantId === tenant.id || c.tenantName === tenant.name);
          setComplaints(tenantComplaints);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading complaints:', error);
        setLoading(false);
      }
    };
    
    loadComplaints();
  }, []);
  
  // Handle notification clicks
  useEffect(() => {
    const handleNotificationClick = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const complaintId = urlParams.get('complaintId');
      const openComments = urlParams.get('openComments') === 'true';
      
      if (complaintId && complaints.length > 0) {
        const complaint = complaints.find(c => c.id === complaintId);
        if (complaint) {
          setSelectedComplaint(complaint);
          setComplaintDialogOpen(true);
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    handleNotificationClick();
  }, [complaints]);
  const [open, setOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { getAll } = await import('../../services/fileDataService');
      
      // Get room information if not available in user object
      let roomNumber = user.room;
      if (!roomNumber) {
        const tenants = await getAll('tenants');
        const tenant = tenants.find((t: any) => 
          t.email === user.email || t.name === user.name ||
          t.email?.toLowerCase() === user.email?.toLowerCase()
        );
        if (tenant) {
          roomNumber = tenant.room;
        }
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('tenantId', user.tenantId || user.id);
      formDataToSend.append('tenantName', user.name);
      formDataToSend.append('tenantPhone', user.phone);
      formDataToSend.append('room', roomNumber);
      formDataToSend.append('hostel', user.hostelName || 'Hostel');
      formDataToSend.append('hostelId', user.hostelId);
      formDataToSend.append('status', 'open');
      formDataToSend.append('createdAt', new Date().toISOString());
      formDataToSend.append('createdBy', user.name);
      
      // Add attachments
      attachments.forEach((file, index) => {
        formDataToSend.append('attachments', file);
      });
      
      // Submit complaint with attachments
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ API_BASE_URL: 'http://192.168.0.138:5000/api' }));
      const apiBaseUrl = config.API_BASE_URL || 'http://192.168.0.138:5000/api';
      
      const response = await fetch(`${apiBaseUrl}/complaints`, {
        method: 'POST',
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit complaint');
      }
      
      const newComplaint = await response.json();
      setComplaints([newComplaint, ...complaints]);
      
      // Show success toast
      toast.success('Complaint submitted successfully!');
      
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    } finally {
      setUploading(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });
    
    if (attachments.length + validFiles.length > 5) {
      toast.error('Maximum 5 attachments allowed');
      return;
    }
    
    setAttachments([...attachments, ...validFiles]);
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'primary';
      case 'cleanliness': return 'secondary';
      case 'food': return 'success';
      case 'noise': return 'warning';
      case 'security': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Complaints</Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }} key={`tenant-complaint-stats-${refreshKey}`}>
        <Card sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Open
            </Typography>
            <Typography variant="h5" color="error.main">
              {complaints.filter(c => c.status === 'open' || c.status === 'reopen').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              In Progress
            </Typography>
            <Typography variant="h5" color="warning.main">
              {complaints.filter(c => c.status === 'in-progress').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Resolved
            </Typography>
            <Typography variant="h5" color="success.main">
              {complaints.filter(c => c.status === 'resolved').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Complaints List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} key={`tenant-complaint-list-${refreshKey}`}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading complaints...</Typography>
          </Box>
        ) : complaints.length === 0 ? (
          <Card elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Comment sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography variant="h6" color="text.secondary">
                No complaints submitted yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                When you have any issues or concerns, you can submit them here
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => setOpen(true)}
                sx={{ mt: 1 }}
              >
                Submit Complaint
              </Button>
            </Box>
          </Card>
        ) : complaints.map((complaint) => (
          <Card key={complaint.id || complaint._id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h6">{complaint.title}</Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip 
                    label={complaint.category} 
                    color={getCategoryColor(complaint.category) as any}
                    size="small"
                  />
                  <Chip 
                    label={complaint.priority} 
                    color={getPriorityColor(complaint.priority) as any}
                    size="small"
                  />
                  <Chip 
                    label={complaint.status} 
                    color={getStatusColor(complaint.status) as any}
                    size="small"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setComplaintDialogOpen(true);
                    }}
                    title="View Details & Comments"
                  >
                    <Comment fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="body2" color="textSecondary" mb={2}>
                {complaint.description}
              </Typography>
              
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                </Typography>
                {complaint.adminNotes && (
                  <Typography variant="body2" color="primary" mt={1}>
                    Admin Response: {complaint.adminNotes}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Complaint</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: '1 1 200px' }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="cleanliness">Cleanliness</MenuItem>
                    <MenuItem value="food">Food</MenuItem>
                    <MenuItem value="noise">Noise</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: '1 1 200px' }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {/* Attachment Upload */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments (Optional)
                </Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="attachment-upload"
                />
                <label htmlFor="attachment-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFile />}
                    disabled={attachments.length >= 5}
                    sx={{ mb: 1 }}
                  >
                    Add Images ({attachments.length}/5)
                  </Button>
                </label>
                
                {attachments.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {attachments.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: 'grey.50'
                        }}
                      >
                        <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeAttachment(index)}
                          sx={{ p: 0.5 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Maximum 5 images, 5MB each. Supported formats: JPG, PNG, GIF
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={uploading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={uploading}>
              {uploading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Mobile FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={() => setOpen(true)}
      >
        <Add />
      </Fab>
      
      {/* Tenant Complaint Dialog */}
      <TenantComplaintDialog
        open={complaintDialogOpen}
        onClose={() => {
          setComplaintDialogOpen(false);
          setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
        openToComments={new URLSearchParams(window.location.search).get('openComments') === 'true'}
      />
    </Box>
  );
};

export default MyComplaints;