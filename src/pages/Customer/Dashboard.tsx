import React, { useState, useEffect } from 'react';
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
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import CheckoutRequestDialog from '../../components/CheckoutRequestDialog';

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { notifications: contextNotifications, unreadCount } = useNotifications();
  
  // Auto-refresh complaints when complaint notifications are received
  useEffect(() => {
    const complaintNotifications = contextNotifications.filter(n => 
      n.type === 'complaint_update' && !n.isRead
    );
    
    if (complaintNotifications.length > 0) {
      const refreshData = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const { getAll } = await import('../../services/fileDataService');
          const tenants = await getAll('tenants');
          const tenant = tenants.find((t: any) => 
            t.email === user.email || t.name === user.name ||
            t.email?.toLowerCase() === user.email?.toLowerCase()
          );
          
          if (tenant) {
            const complaints = await getAll('complaints');
            const tenantComplaints = complaints.filter((c: any) => 
              c.tenantId === tenant.id || c.tenantName === tenant.name
            );
            setRecentComplaints(tenantComplaints);
            
            // Force re-render of complaint cards
            setRefreshKey(prev => prev + 1);
          }
        } catch (error) {
          console.error('Error refreshing complaints:', error);
        }
      };
      
      refreshData();
    }
  }, [contextNotifications]);
  
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

  const [tenantData, setTenantData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any>({ history: [], summary: {} });
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadTenantData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { getAll } = await import('../../services/fileDataService');
        
        // Get tenant data based on user email
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
          setTenantData(tenant);
          
          // Get all data in parallel
          const [complaints, notices, payments, rooms] = await Promise.all([
            getAll('complaints'),
            getAll('notices'),
            getAll('payments'),
            getAll('rooms')
          ]);
          
          // Set complaints
          const tenantComplaints = complaints.filter((c: any) => c.tenantId === tenant.id || c.tenantName === tenant.name);
          setRecentComplaints(tenantComplaints);
          
          // Set notices (combine with context notifications)
          const hostelNotices = notices.filter((n: any) => n.hostelId === tenant.hostelId && n.status === 'active');
          const staticNotifications = hostelNotices.map((n: any) => ({
            id: n.id,
            type: 'announcement',
            title: n.title,
            message: n.message,
            date: n.createdAt,
            read: false,
            priority: n.priority || 'medium'
          }));
          
          // Combine with real-time notifications from context
          const allNotifications = [...contextNotifications, ...staticNotifications];
          setNotifications(allNotifications);
          
          // Set payment data
          const tenantPayments = payments.filter((p: any) => p.tenantId === tenant.id);
          const totalPaid = tenantPayments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          const pendingAmount = tenantPayments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          setPaymentData({
            history: tenantPayments,
            summary: { totalPaid, pendingAmount, monthlyRent: Number(tenant.rent || 0) }
          });
          
          // Set room data
          const tenantRoom = rooms.find((r: any) => r.roomNumber === tenant.room || r.id === tenant.roomId);
          setRoomData(tenantRoom);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading tenant data:', error);
        setLoading(false);
      }
    };
    
    loadTenantData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography>Loading...</Typography></Box>;
  }

  if (!tenantData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography>Tenant data not found</Typography></Box>;
  }

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { create } = await import('../../services/fileDataService');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await create('complaints', {
        ...complaintData,
        tenantId: tenantData.id,
        tenantName: tenantData.name,
        room: tenantData.room,
        hostelId: tenantData.hostelId,
        status: 'open',
        createdAt: new Date().toISOString(),
        createdBy: user.name
      });
      
      setComplaintOpen(false);
      setComplaintData({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium'
      });
      
      // Refresh complaints data
      window.location.reload();
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
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

  const totalUnreadCount = notifications.filter(n => !n.read).length + unreadCount;

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Welcome, {tenantData?.name || 'Tenant'}
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          {!isMobile && (
            <>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setComplaintOpen(true)}>
                New Complaint
              </Button>

            </>
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
                  {tenantData?.room || 'N/A'}
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
                  ₹{Number(tenantData?.rent || 0).toLocaleString()}
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
                <Typography variant="h4" sx={{ fontWeight: 700, color: (tenantData?.pendingDues || 0) > 0 ? 'error.main' : 'success.main' }}>
                  ₹{Number(tenantData?.pendingDues || 0).toLocaleString()}
                </Typography>
              </Box>
              <Payment color={(tenantData?.pendingDues || 0) > 0 ? 'error' : 'success'} sx={{ fontSize: 40 }} />
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
                  {tenantData?.nextDueDate ? new Date(tenantData.nextDueDate).toLocaleDateString() : 'N/A'}
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
            <Box key={tenantData?.lastUpdated || 'complaints'}>
              {recentComplaints.length > 0 ? recentComplaints.map((complaint) => (
                <Box key={complaint.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #eee' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {complaint.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : complaint.date ? new Date(complaint.date).toLocaleDateString() : 'N/A'}
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
              )) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No complaints submitted
                </Typography>
              )}
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
                <Card><CardContent><Typography variant="body2" color="text.secondary">Total Paid</Typography><Typography variant="h6" color="success.main">₹{paymentData.summary.totalPaid?.toLocaleString() || '0'}</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Pending</Typography><Typography variant="h6" color="warning.main">₹{paymentData.summary.pendingAmount?.toLocaleString() || '0'}</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Monthly Rent</Typography><Typography variant="h6">₹{paymentData.summary.monthlyRent?.toLocaleString() || '0'}</Typography></CardContent></Card>
              </Box>
              <List>
                {paymentData.history.slice(0, 5).map((payment: any) => (
                  <ListItem key={payment.id}>
                    <ListItemText 
                      primary={`${payment.month}/${payment.year} - ₹${Number(payment.amount || 0).toLocaleString()}`} 
                      secondary={payment.paymentDate ? `Paid on ${new Date(payment.paymentDate).toLocaleDateString()}` : 'Payment pending'} 
                    />
                    <Chip label={payment.status} color={getStatusColor(payment.status) as any} size="small" />
                  </ListItem>
                ))}
                {paymentData.history.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No payment history available</Typography>
                )}
              </List>
            </Box>
          )}
          {selectedAction === 'complaints' && (
            <Box key={`complaints-section-${refreshKey}`}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Open</Typography><Typography variant="h6" color="error.main">{recentComplaints.filter(c => c.status === 'open').length}</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">In Progress</Typography><Typography variant="h6" color="warning.main">{recentComplaints.filter(c => c.status === 'in-progress').length}</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Resolved</Typography><Typography variant="h6" color="success.main">{recentComplaints.filter(c => c.status === 'resolved').length}</Typography></CardContent></Card>
              </Box>
              <List key={`complaint-list-${refreshKey}`}>
                {recentComplaints.slice(0, 5).map((complaint: any) => (
                  <ListItem key={`${complaint.id}-${complaint.status}-${complaint.updatedAt}`}>
                    <ListItemText 
                      primary={complaint.title} 
                      secondary={`Submitted on ${new Date(complaint.createdAt || complaint.date).toLocaleDateString()}`} 
                    />
                    <Chip label={complaint.status} color={getStatusColor(complaint.status) as any} size="small" />
                  </ListItem>
                ))}
                {recentComplaints.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No complaints submitted</Typography>
                )}
              </List>
            </Box>
          )}
          {selectedAction === 'room' && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Card><CardContent><Typography variant="h6" gutterBottom>Room {tenantData?.room || 'N/A'}</Typography><Typography variant="body2" color="text.secondary" gutterBottom>Type</Typography><Typography variant="body1">{roomData?.type || 'N/A'}</Typography><Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Floor</Typography><Typography variant="body1">{roomData?.floor || 'N/A'}</Typography></CardContent></Card>
                <Card><CardContent><Typography variant="h6" gutterBottom>Rent Details</Typography><Typography variant="body2" color="text.secondary" gutterBottom>Monthly Rent</Typography><Typography variant="h6" color="primary.main">₹{Number(tenantData?.rent || 0).toLocaleString()}</Typography><Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Capacity</Typography><Typography variant="body1">{roomData?.capacity || 'N/A'} bed(s)</Typography></CardContent></Card>
              </Box>
              {roomData?.amenities && (
                <Card sx={{ mt: 2 }}><CardContent><Typography variant="h6" gutterBottom>Amenities</Typography><Typography variant="body2">{roomData.amenities}</Typography></CardContent></Card>
              )}
            </Box>
          )}
          {selectedAction === 'notices' && (
            <Box>
              {notifications.length > 0 ? (
                <List>
                  {notifications.map((notice) => (
                    <ListItem key={notice.id}>
                      <ListItemIcon>
                        <Announcement color={getPriorityColor(notice.priority) as any} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={notice.title} 
                        secondary={`${notice.message} - ${new Date(notice.date).toLocaleDateString()}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No notices available
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Request Dialog */}
      <CheckoutRequestDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        tenant={tenantData}
        noticePeriod={30}
      />

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