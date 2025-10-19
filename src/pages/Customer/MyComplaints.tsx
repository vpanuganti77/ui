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
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';

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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { create } = await import('../../services/fileDataService');
      
      const complaintData = {
        ...formData,
        tenantId: user.tenantId || user.id,
        tenantName: user.name,
        tenantPhone: user.phone,
        room: user.room,
        hostel: user.hostelName || 'Hostel',
        hostelId: user.hostelId,
        status: 'open',
        createdAt: new Date().toISOString(),
        createdBy: user.name
      };
      
      const newComplaint = await create('complaints', complaintData);
      setComplaints([newComplaint, ...complaints]);
      
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
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
              {complaints.filter(c => c.status === 'open').length}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography color="text.secondary">No complaints found</Typography>
          </Box>
        ) : complaints.map((complaint) => (
          <Card key={complaint.id || complaint._id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h6">{complaint.title}</Typography>
                <Box display="flex" gap={1}>
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
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
    </Box>
  );
};

export default MyComplaints;