import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { CapacitorNotificationService } from '../services/capacitorNotificationService';
import { Capacitor } from '@capacitor/core';

const TestPushNotification: React.FC = () => {
  const handleTestNotification = async () => {
    if (Capacitor.isNativePlatform()) {
      await CapacitorNotificationService.showLocalNotification(
        'Test Notification',
        'This is a test push notification from PGFlow!'
      );
    } else {
      // Web fallback
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test push notification from PGFlow!',
          icon: '/icon-192.png'
        });
      } else {
        alert('Please enable notifications in your browser settings');
      }
    }
  };

  const handleRequestPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      await CapacitorNotificationService.initialize();
    } else {
      await Notification.requestPermission();
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Push Notification Test
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Platform: {Capacitor.isNativePlatform() ? 'Native Android' : 'Web Browser'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleRequestPermission}
          size="small"
        >
          Request Permission
        </Button>
        <Button 
          variant="contained" 
          onClick={handleTestNotification}
          size="small"
        >
          Test Notification
        </Button>
      </Box>
    </Box>
  );
};

export default TestPushNotification;