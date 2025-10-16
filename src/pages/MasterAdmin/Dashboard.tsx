import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button
} from '@mui/material';
import { Business, Person, RequestPage, CheckCircle } from '@mui/icons-material';
import { getAll, update } from '../../services/fileDataService';

const Dashboard: React.FC = () => {
  const [hostels, setHostels] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

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
      await update('hostelRequests', requestId, { status: 'approved' });
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to approve request:', error);
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
    </Box>
  );
};

export default Dashboard;