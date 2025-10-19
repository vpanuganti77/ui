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
import UserCredentialsDialog from '../../components/UserCredentialsDialog';

const Dashboard: React.FC = () => {
  const [hostels, setHostels] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    userDetails: any;
  }>({ open: false, userDetails: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadData();
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
      
      const adminPassword = 'admin' + Math.random().toString(36).substring(2, 8);
      const hostelId = Date.now().toString();
      const currentDate = new Date().toISOString();
      
      // Create hostel first
      const newHostel = {
        name: request.hostelName || request.name,
        address: request.address || '',
        planType: request.planType || 'free_trial',
        planStatus: 'trial',
        trialExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adminName: request.name || '',
        adminEmail: request.email || '',
        adminPhone: request.phone || '',
        status: 'active',
        totalRooms: 0,
        occupiedRooms: 0
      };
      
      const createdHostel = await create('hostels', newHostel);
      
      // Generate hostel-scoped email for admin
      const hostelDomain = (request.hostelName || request.name).toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const adminUsername = (request.name || 'admin').toLowerCase().replace(/[^a-z0-9]/g, '');
      const adminEmail = `${adminUsername}@${hostelDomain}`;
      
      // Create admin user
      const adminUser = {
        name: request.name || '',
        email: adminEmail,
        phone: request.phone || '',
        role: 'admin',
        password: adminPassword,
        hostelId: createdHostel.id,
        hostelName: request.hostelName || '',
        status: 'active'
      };
      
      await create('users', adminUser);
      
      // Update request status
      await update('hostelRequests', requestId, {
        ...request,
        status: 'approved',
        isRead: true,
        processedAt: currentDate,
        updatedAt: currentDate
      });
      
      setCredentialsDialog({
        open: true,
        userDetails: {
          name: request.name,
          email: adminEmail,
          password: adminPassword,
          hostelName: request.hostelName,
          role: 'Admin'
        }
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Hostel and admin account created successfully!', 
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
      
      <UserCredentialsDialog
        open={credentialsDialog.open}
        onClose={() => setCredentialsDialog({ open: false, userDetails: null })}
        userDetails={credentialsDialog.userDetails}
      />
      
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