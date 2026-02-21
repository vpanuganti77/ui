import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography, Button, Chip } from '@mui/material';
import { Warning, Schedule } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getAll } from '../../../shared/services/storage/fileDataService';

const TrialStatus: React.FC = () => {
  const { user } = useAuth();
  const [hostel, setHostel] = useState<any>(null);

  useEffect(() => {
    const fetchHostelData = async () => {
      if (user?.hostelId && user.role !== 'master_admin' && user.role !== 'tenant') {
        try {
          const hostels = await getAll('hostels');
          const userHostel = hostels.find((h: any) => h.id === user.hostelId);
          setHostel(userHostel);
        } catch (error) {
          console.error('Error fetching hostel data:', error);
        }
      }
    };
    fetchHostelData();
  }, [user]);

  if (!user || user.role === 'master_admin' || user.role === 'tenant' || !hostel) {
    return null;
  }

  if (hostel.planType !== 'free_trial') {
    return null;
  }

  const today = new Date();
  const expiryDate = new Date(hostel.trialExpiryDate);
  
  // Check if the expiry date is valid
  if (isNaN(expiryDate.getTime())) {
    console.warn('Invalid trial expiry date:', hostel.trialExpiryDate);
    return null;
  }
  
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return (
      <Alert 
        severity="error" 
        icon={<Warning />}
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" variant="outlined">
            Upgrade Now
          </Button>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Your free trial has expired!
        </Typography>
        <Typography variant="body2">
          Please contact support to upgrade to a premium plan to continue using the system.
        </Typography>
      </Alert>
    );
  }

  if (daysLeft <= 7) {
    return (
      <Alert 
        severity="warning" 
        icon={<Schedule />}
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" variant="outlined">
            Upgrade Plan
          </Button>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Free trial expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="body2">
          Upgrade to a premium plan to continue accessing all features.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip 
        icon={<Schedule />}
        label={`Free Trial: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        color="info"
        variant="outlined"
        size="small"
      />
    </Box>
  );
};

export default TrialStatus;
