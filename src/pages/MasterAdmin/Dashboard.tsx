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
      
      let hostel: any;
      let hostelId: string;
      
      if (existingHostel) {
        // Update existing hostel's contactEmail to match user's email domain
        const hostelDomain = request.hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        const username = request.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const hostelContactEmail = `${username}@${hostelDomain}`;
        
        const updatedHostelData = {
          ...existingHostel,
          contactEmail: hostelContactEmail,
          originalContactEmail: request.email,
          domain: hostelDomain, // Add domain field for validation
          allowedDomains: [hostelDomain], // Add allowed domains array
          status: 'active' // Set status to active
        };
        
        hostel = await update('hostels', existingHostel.id, updatedHostelData);
        hostelId = existingHostel.id;
      } else {
        // Create hostel with unique ID
        hostelId = `hostel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate hostel domain email to match user's email
        const hostelDomain = request.hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        const username = request.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const hostelContactEmail = `${username}@${hostelDomain}`;
        
        const hostelData = {
          id: hostelId,
          name: `${request.hostelName}_${Date.now()}`,
          displayName: request.hostelName,
          address: request.address,
          contactPerson: request.name,
          contactEmail: hostelContactEmail, // Use hostel domain email
          originalContactEmail: request.email, // Store original email
          contactPhone: request.phone,
          planType: request.planType,
          status: 'active',
          domain: hostelDomain, // Add domain field for validation
          allowedDomains: [hostelDomain], // Add allowed domains array
          trialExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'Master Admin'
        };
        
        hostel = await create('hostels', hostelData);
      }
      
      // Find and update existing user (don't create new one)
      const users = await getAll('users');
      const user = users.find((u: any) => 
        u.originalEmail === request.email || u.requestId === request.id
      );
      
      if (!user) {
        throw new Error('User account not found for this request');
      }
      
      const updatedUser = {
        ...user,
        status: 'active',
        hostelId: hostel.id || hostelId, // This should be the actual hostel ID
        hostelName: request.hostelName,
        approvedAt: new Date().toISOString()
      };
      
      console.log('Updating user hostelId from', user.hostelId, 'to', hostel.id || hostelId);
      
      await update('users', user.id, updatedUser);
      
      // If this is the current user, update localStorage and reconnect WebSocket
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.email === user.email) {
        // Update localStorage with new hostelId
        const updatedCurrentUser = { ...currentUser, hostelId: hostel.id || hostelId, status: 'active' };
        localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
        
        // Force WebSocket reconnection with updated user data
        socketService.disconnect();
        setTimeout(() => {
          socketService.connect(updatedCurrentUser);
        }, 1000);
        
        console.log('Updated current user hostelId and reconnected WebSocket');
      }
      
      // Update request status
      const updatedRequest = {
        ...request,
        status: 'approved',
        processedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        hostelId: hostel.id || hostelId
      };
      await update('hostelRequests', requestId, updatedRequest);
      
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
        
        // Send push notification
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(notification.title, {
              body: notification.message,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: `hostel-approved-${(hostel?.id || hostelId) ?? 'unknown'}`,
              requireInteraction: true,
              data: { type: 'hostel_approved', userId: user.id }
            });
          });
        }
        
        // Trigger dashboard refresh for current user
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        window.dispatchEvent(new CustomEvent('refreshData'));
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
                  <Typography variant="subtitle1">{hostel.displayName || hostel.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Owner: {hostel.contactPerson || 'N/A'} | Address: {hostel.address || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Plan: {hostel.planType || 'Free Trial'} | Created: {new Date(hostel.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip
                    label={hostel.status === 'active' ? 'Active' : hostel.status || 'Active'}
                    color={hostel.status === 'active' ? 'success' : hostel.status === 'inactive' ? 'error' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={hostel.planType === 'free_trial' ? 'Trial' : hostel.planType || 'Trial'}
                    color={hostel.planType === 'free_trial' ? 'info' : 'primary'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
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