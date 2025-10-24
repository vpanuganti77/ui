import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Paper
} from '@mui/material';
import { Schedule, CheckCircle, Business, Refresh } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getAll } from '../services/fileDataService';
import { useNotifications } from '../context/NotificationContext';

const PendingApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [requestStatus, setRequestStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkRequestStatus = async () => {
    try {
      const requests = await getAll('hostelRequests');
      const userRequest = requests.find((r: any) => r.email === user?.email);
      setRequestStatus(userRequest);
      setLoading(false);
    } catch (error) {
      console.error('Error checking request status:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRequestStatus();
    
    // Check for approval notifications
    const approvalNotifications = notifications.filter(n => 
      n.type === 'hostel_approved' && !n.isRead
    );
    
    if (approvalNotifications.length > 0) {
      // Update localStorage user status and refresh
      const updatedUser = { ...user, status: 'active' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    }
  }, [notifications, user?.email]);
  
  // Auto-refresh every 10 seconds to check for approval
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { getAll } = await import('../services/fileDataService');
        const users = await getAll('users');
        const currentUser = users.find((u: any) => 
          u.email === user?.email && (user?.requestId ? u.requestId === user.requestId : true)
        );
        
        if (currentUser && currentUser.status === 'active') {
          // Update localStorage with the approved user data
          const updatedUser = {
            ...currentUser,
            isAuthenticated: true
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('token', localStorage.getItem('token') || 'approved_token_' + Date.now());
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [user?.email, user?.requestId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box textAlign="center" mb={4}>
        <Business sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome to PGFlow!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your hostel setup is in progress
        </Typography>
      </Box>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Schedule sx={{ fontSize: 32, color: 'warning.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Account Pending Approval
              </Typography>
              <Typography color="text.secondary">
                Your hostel setup request is being reviewed by our team
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>What happens next?</strong><br/>
              • Our team will review your hostel details<br/>
              • You'll receive a notification once approved<br/>
              • Your dashboard will automatically update with full access
            </Typography>
          </Alert>

          {requestStatus && (
            <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Request Details
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Hostel Name:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{requestStatus.hostelName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Plan:</Typography>
                  <Chip label="Free Trial" color="success" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Status:</Typography>
                  <Chip 
                    label={requestStatus.status} 
                    color={requestStatus.status === 'approved' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Submitted:</Typography>
                  <Typography>{new Date(requestStatus.submittedAt).toLocaleDateString()}</Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          <Box display="flex" justifyContent="center" mt={3}>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />} 
              onClick={checkRequestStatus}
            >
              Check Status
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Need Help?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            If you have any questions about your setup or need assistance, feel free to contact our support team.
          </Typography>
          <Button variant="contained" color="primary">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PendingApprovalDashboard;