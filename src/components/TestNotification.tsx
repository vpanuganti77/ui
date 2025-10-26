import React from 'react';
import { Button, Box } from '@mui/material';
import { API_CONFIG } from '../config/api';

const TestNotification: React.FC = () => {
  const testWebSocketNotification = async () => {
    try {
      // Get current user's hostelId
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const hostelId = user?.hostelId;
      
      console.log('Testing with hostelId:', hostelId);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/test-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: 'admin',
          hostelId: hostelId,
          message: 'Test notification from frontend'
        })
      });
      
      if (response.ok) {
        console.log('Test notification sent successfully');
      } else {
        console.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Button 
        variant="contained" 
        onClick={testWebSocketNotification}
        color="secondary"
      >
        Test WebSocket Notification
      </Button>
    </Box>
  );
};

export default TestNotification;