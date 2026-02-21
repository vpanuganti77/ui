import React from 'react';
import { Button, Box } from '@mui/material';
import { TestNotificationService } from '../services/testNotificationService';

const TestNotificationButton: React.FC = () => {
  const handleTestNotification = async () => {
    console.log('Testing notifications...');
    await TestNotificationService.initialize();
    await TestNotificationService.showTestNotification();
  };

  const handleComplaintTest = async () => {
    console.log('Testing complaint notification...');
    await TestNotificationService.initialize();
    await TestNotificationService.showComplaintNotification('123', 'resolved');
  };

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleTestNotification}
      >
        Test Notification
      </Button>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleComplaintTest}
      >
        Test Complaint Notification
      </Button>
    </Box>
  );
};

export default TestNotificationButton;
