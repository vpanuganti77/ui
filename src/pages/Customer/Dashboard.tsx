import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Hotel,
  AttachMoney,
  ReportProblem,
  Notifications,
  Add,
  CheckCircle,
  Warning,
  Info,
  Close,
  Payment,
  Build,
  Announcement,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [complaintData, setComplaintData] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium'
  });

  // Mock tenant data
  const tenantData = {
    name: 'John Doe',
    room: 'R001',
    rent: 8000,
    pendingDues: 0,
    nextDueDate: '2024-04-05',
    joiningDate: '2024-01-15',
    status: 'active'
  };

  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Rent Due Reminder',
      message: 'Your rent for April 2024 is due on 5th April',
      date: '2024-03-28',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Maintenance Update',
      message: 'Your AC repair complaint has been resolved',
      date: '2024-03-25',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'announcement',
      title: 'Hostel Notice',
      message: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM',
      date: '2024-03-24',
      read: true,
      priority: 'low'
    }
  ];

  const recentComplaints = [
    {
      id: 1,
      title: 'AC not working',
      status: 'in-progress',
      date: '2024-03-20',
      priority: 'high'
    },
    {
      id: 2,
      title: 'WiFi connectivity issue',
      status: 'open',
      date: '2024-03-18',
      priority: 'medium'
    }
  ];

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit complaint:', complaintData);
    setComplaintOpen(false);
    setComplaintData({
      title: '',
      description: '',
      category: 'maintenance',
      priority: 'medium'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Welcome, {tenantData.name}
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Badge badgeContent={unreadCount} color="error">
            <IconButton onClick={() => setNotificationOpen(true)}>
              <Notifications />
            </IconButton>
          </Badge>
          {!isMobile && (
            <Button variant="outlined" startIcon={<Add />} onClick={() => setComplaintOpen(true)}>
              New Complaint
            </Button>
          )}
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                  Room Number
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {tenantData.room}
                </Typography>
              </Box>
              <Hotel color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                  Monthly Rent
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  ₹{tenantData.rent.toLocaleString()}
                </Typography>
              </Box>
              <AttachMoney color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                  Pending Dues
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: tenantData.pendingDues > 0 ? 'error.main' : 'success.main' }}>
                  ₹{tenantData.pendingDues.toLocaleString()}
                </Typography>
              </Box>
              <Payment color={tenantData.pendingDues > 0 ? 'error' : 'success'} sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                  Next Due
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {new Date(tenantData.nextDueDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Notifications color="info" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Payment />}
                onClick={() => { setSelectedAction('payments'); setDetailsOpen(true); }}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                View Payment History
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReportProblem />}
                onClick={() => { setSelectedAction('complaints'); setDetailsOpen(true); }}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                My Complaints
              </Button>
              <Button
                variant="outlined"
                startIcon={<Hotel />}
                onClick={() => { setSelectedAction('room'); setDetailsOpen(true); }}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Room Details
              </Button>
              <Button
                variant="outlined"
                startIcon={<Announcement />}
                onClick={() => { setSelectedAction('notices'); setDetailsOpen(true); }}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Notices & Announcements
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={() => setCheckoutOpen(true)}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Checkout Request
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Complaints
            </Typography>
            <Box>
              {recentComplaints.map((complaint) => (
                <Box key={complaint.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #eee' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {complaint.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(complaint.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
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
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Notifications Dialog */}
      <Dialog open={notificationOpen} onClose={() => setNotificationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={() => setNotificationOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id} divider>
                <ListItemIcon>
                  {notification.type === 'payment' && <Payment color={getPriorityColor(notification.priority) as any} />}
                  {notification.type === 'maintenance' && <Build color={getPriorityColor(notification.priority) as any} />}
                  {notification.type === 'announcement' && <Announcement color={getPriorityColor(notification.priority) as any} />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.title}
                      </Typography>
                      {!notification.read && <Badge color="error" variant="dot" />}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* New Complaint Dialog */}
      <Dialog open={complaintOpen} onClose={() => setComplaintOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Complaint</DialogTitle>
        <form onSubmit={handleComplaintSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={complaintData.title}
                onChange={(e) => setComplaintData({...complaintData, title: e.target.value})}
                required
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                value={complaintData.description}
                onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
                required
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={complaintData.category}
                    label="Category"
                    onChange={(e) => setComplaintData({...complaintData, category: e.target.value})}
                  >
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="cleanliness">Cleanliness</MenuItem>
                    <MenuItem value="food">Food</MenuItem>
                    <MenuItem value="noise">Noise</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={complaintData.priority}
                    label="Priority"
                    onChange={(e) => setComplaintData({...complaintData, priority: e.target.value})}
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
            <Button onClick={() => setComplaintOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {selectedAction === 'payments' && 'Payment History'}
              {selectedAction === 'complaints' && 'My Complaints'}
              {selectedAction === 'room' && 'Room Details'}
              {selectedAction === 'notices' && 'Notices & Announcements'}
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAction === 'payments' && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Total Paid</Typography><Typography variant="h6" color="success.main">₹16,000</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Pending</Typography><Typography variant="h6" color="warning.main">₹8,000</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Next Due</Typography><Typography variant="h6">Apr 5, 2024</Typography></CardContent></Card>
              </Box>
              <List>
                <ListItem><ListItemText primary="March 2024 - ₹8,000" secondary="Paid on Mar 5, 2024" /><Chip label="Paid" color="success" size="small" /></ListItem>
                <ListItem><ListItemText primary="February 2024 - ₹8,000" secondary="Paid on Feb 3, 2024" /><Chip label="Paid" color="success" size="small" /></ListItem>
                <ListItem><ListItemText primary="April 2024 - ₹8,000" secondary="Due on Apr 5, 2024" /><Chip label="Pending" color="warning" size="small" /></ListItem>
              </List>
            </Box>
          )}
          {selectedAction === 'complaints' && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Open</Typography><Typography variant="h6" color="error.main">1</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">In Progress</Typography><Typography variant="h6" color="warning.main">1</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Resolved</Typography><Typography variant="h6" color="success.main">3</Typography></CardContent></Card>
              </Box>
              <List>
                <ListItem><ListItemText primary="AC not working" secondary="Submitted on Mar 20, 2024" /><Chip label="In Progress" color="warning" size="small" /></ListItem>
                <ListItem><ListItemText primary="WiFi connectivity issue" secondary="Submitted on Mar 18, 2024" /><Chip label="Open" color="error" size="small" /></ListItem>
                <ListItem><ListItemText primary="Cleaning request" secondary="Submitted on Mar 15, 2024" /><Chip label="Resolved" color="success" size="small" /></ListItem>
              </List>
            </Box>
          )}
          {selectedAction === 'room' && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Card><CardContent><Typography variant="h6" gutterBottom>Room {tenantData.room}</Typography><Typography variant="body2" color="text.secondary" gutterBottom>Type</Typography><Typography variant="body1">Single Occupancy</Typography><Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Floor</Typography><Typography variant="body1">1st Floor</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="h6" gutterBottom>Rent Details</Typography><Typography variant="body2" color="text.secondary" gutterBottom>Monthly Rent</Typography><Typography variant="h6" color="primary.main">₹{tenantData.rent.toLocaleString()}</Typography><Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Security Deposit</Typography><Typography variant="body1">₹16,000</Typography></CardContent></Card>
              </Box>
              <Card sx={{ mt: 2 }}><CardContent><Typography variant="h6" gutterBottom>Amenities</Typography><Box display="flex" flexWrap="wrap" gap={1}>{['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'].map(amenity => <Chip key={amenity} label={amenity} size="small" variant="outlined" />)}</Box></CardContent></Card>
            </Box>
          )}
          {selectedAction === 'notices' && (
            <List>
              <ListItem><ListItemIcon><Announcement color="info" /></ListItemIcon><ListItemText primary="Water Supply Interruption" secondary="Tomorrow 10 AM - 2 PM for maintenance work" /></ListItem>
              <ListItem><ListItemIcon><Announcement color="warning" /></ListItemIcon><ListItemText primary="Rent Due Reminder" secondary="April rent is due on 5th April 2024" /></ListItem>
              <ListItem><ListItemIcon><Announcement color="success" /></ListItemIcon><ListItemText primary="WiFi Upgrade Complete" secondary="New high-speed internet is now available" /></ListItem>
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Notice Period: 30 days required for advance refund
            </Alert>
            <TextField
              fullWidth
              label="Checkout Date"
              type="date"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            {checkoutDate && (() => {
              const today = new Date();
              const selectedDate = new Date(checkoutDate);
              const daysDiff = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isValidNotice = daysDiff >= 30;
              const refundAmount = isValidNotice ? 16000 : 0;
              
              return (
                <Box>
                  <Alert severity={isValidNotice ? 'success' : 'warning'} sx={{ mb: 2 }}>
                    {isValidNotice 
                      ? `✓ Valid notice period (${daysDiff} days). Advance refund: ₹${refundAmount.toLocaleString()}`
                      : `⚠ Insufficient notice period (${daysDiff} days). No advance refund available.`
                    }
                  </Alert>
                  <Card sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Refund Summary</Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Security Deposit:</Typography>
                        <Typography>₹16,000</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Pending Dues:</Typography>
                        <Typography>₹{tenantData.pendingDues.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" sx={{ fontWeight: 600, borderTop: 1, borderColor: 'divider', pt: 1 }}>
                        <Typography>Final Refund:</Typography>
                        <Typography color={refundAmount > 0 ? 'success.main' : 'error.main'}>
                          ₹{Math.max(0, refundAmount - tenantData.pendingDues).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCheckoutOpen(false); setCheckoutDate(''); }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            disabled={!checkoutDate}
            onClick={() => {
              console.log('Checkout request submitted for:', checkoutDate);
              setCheckoutOpen(false);
              setCheckoutDate('');
            }}
          >
            Submit Checkout Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
          onClick={() => setComplaintOpen(true)}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default TenantDashboard;