import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { Business, Person, RequestPage, CheckCircle } from '@mui/icons-material';
import { getAll, update, create } from '../../services/fileDataService';
import { socketService } from '../../services/socketService';


const Dashboard: React.FC = () => {
  const [hostels, setHostels] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  useEffect(() => {
    loadData();
    
    // Connect to WebSocket for real-time updates
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        socketService.connect(user);
        
        // Listen for notifications that should trigger data refresh
        socketService.onNotification((notification) => {
          if (notification.type === 'hostelRequest' || notification.type === 'hostel_approved') {
            loadData(); // Refresh data when hostel-related notifications arrive
          }
        });
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    }
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      const [hostelData, requestData] = await Promise.all([
        getAll('hostels'),
        getAll('hostelRequests')
      ]);
      setHostels(hostelData);
      setRequests(requestData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;
      
      // Prevent duplicate approval
      if (request.status === 'approved') {
        setSnackbar({ 
          open: true, 
          message: 'Request is already approved!', 
          severity: 'error' 
        });
        return;
      }
      
      // Check if hostel already exists for this request
      const existingHostel = hostels.find((h: any) => 
        h.contactEmail === request.email || h.name === request.hostelName
      );
      
      let hostel;
      let hostelId;
      
      if (existingHostel) {
        hostel = existingHostel;
        hostelId = existingHostel.id;
      } else {
        // Create hostel with unique ID
        hostelId = `hostel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const hostelData = {
          id: hostelId,
          name: `${request.hostelName}_${Date.now()}`,
          displayName: request.hostelName,
          address: request.address,
          contactPerson: request.name,
          contactEmail: request.email,
          contactPhone: request.phone,
          planType: request.planType,
          status: 'active',
          trialExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'Master Admin'
        };
        
        hostel = await create('hostels', hostelData);
      }
      
      // Find and update existing user (don't create new one)
      const users = await getAll('users');
      const user = users.find((u: any) => 
        u.email === request.email || u.requestId === request.id
      );
      
      if (!user) {
        throw new Error('User account not found for this request');
      }
      
      const updatedUser = {
        ...user,
        status: 'active',
        hostelId: hostel.id || hostelId,
        hostelName: request.hostelName,
        approvedAt: new Date().toISOString()
      };
      
      await update('users', user.id, updatedUser);
      
      // Update request status
      await update('hostelRequests', requestId, {
        ...request,
        status: 'approved',
        processedAt: new Date().toISOString(),
        hostelId: hostel.id || hostelId
      });
      
      // Create notification for the hostel admin
      const notification = {
        id: `${Date.now()}_${user.id}_approval`,
        type: 'hostel_approved',
        title: 'Hostel Approved!',
        message: `Your hostel "${request.hostelName}" has been approved and is now active. You can now access all features.`,
        userId: user.id,
        hostelId: hostel.id || hostelId,
        priority: 'high',
        isRead: false,
        createdAt: new Date().toISOString(),
        createdBy: 'Master Admin'
      };
      
      try {
        await create('notifications', notification);
        console.log('Created approval notification for user:', user.name);
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }
      
      setSnackbar({ 
        open: true, 
        message: 'Hostel request approved successfully!', 
        severity: 'success' 
      });
      
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to approve request:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 
        severity: 'error' 
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await update('hostelRequests', requestId, { status: 'rejected' });
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Master Admin Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Business color="primary" />
              <Box>
                <Typography variant="h4">{hostels.length}</Typography>
                <Typography color="text.secondary">Total Hostels</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <RequestPage color="warning" />
              <Box>
                <Typography variant="h4">{pendingRequests.length}</Typography>
                <Typography color="text.secondary">Pending Requests</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle color="success" />
              <Box>
                <Typography variant="h4">{approvedRequests.length}</Typography>
                <Typography color="text.secondary">Approved Requests</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Person color="info" />
              <Box>
                <Typography variant="h4">{requests.length}</Typography>
                <Typography color="text.secondary">Total Requests</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {pendingRequests.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Pending Hostel Requests
            </Typography>
            {pendingRequests.map((request) => (
              <Box
                key={request.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{request.hostelName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Owner: {request.ownerName} | Email: {request.ownerEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {request.location} | Capacity: {request.capacity}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleApproveRequest(request.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Active Hostels
          </Typography>
          {hostels.length === 0 ? (
            <Typography color="text.secondary">No hostels registered yet.</Typography>
          ) : (
            hostels.map((hostel) => (
              <Box
                key={hostel.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{hostel.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hostel.location} | Capacity: {hostel.capacity}
                  </Typography>
                </Box>
                <Chip
                  label={hostel.status || 'Active'}
                  color="success"
                  size="small"
                />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
      

      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;