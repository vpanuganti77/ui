import React from 'react';
import { Button } from '@mui/material';
import { CleanNotificationService } from '../services/cleanNotificationService';

export const NotificationTestButton: React.FC = () => {
  const testNotification = () => {
    CleanNotificationService.showLocalNotification(
      'Test Notification',
      'This is a test notification to verify the system works'
    );
  };

  return (
    <Button 
      onClick={testNotification}
      variant="contained" 
      color="primary"
      sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
    >
      Test Notification
    </Button>
  );
};