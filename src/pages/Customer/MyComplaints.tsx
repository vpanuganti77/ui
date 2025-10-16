import React, { useState } from 'react';
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

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState([
    {
      _id: '1',
      title: 'AC not working',
      description: 'The air conditioner in my room is not cooling properly.',
      category: 'maintenance',
      priority: 'high',
      status: 'in-progress',
      createdAt: '2024-03-15T10:30:00Z',
      adminNotes: 'Technician will visit tomorrow'
    },
    {
      _id: '2',
      title: 'WiFi connectivity issue',
      description: 'Internet connection is very slow in my room.',
      category: 'maintenance',
      priority: 'medium',
      status: 'open',
      createdAt: '2024-03-14T14:20:00Z',
      adminNotes: ''
    },
    {
      _id: '3',
      title: 'Cleaning request',
      description: 'Common area needs cleaning.',
      category: 'cleanliness',
      priority: 'low',
      status: 'resolved',
      createdAt: '2024-03-13T09:15:00Z',
      adminNotes: 'Cleaning completed'
    }
  ]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit complaint:', formData);
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium'
    });
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Card sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Open
            </Typography>
            <Typography variant="h5" color="error.main">
              1
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              In Progress
            </Typography>
            <Typography variant="h5" color="warning.main">
              1
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Resolved
            </Typography>
            <Typography variant="h5" color="success.main">
              1
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Complaints List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {complaints.map((complaint) => (
          <Card key={complaint._id}>
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