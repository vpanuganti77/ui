import React from 'react';
import { Button, Box } from '@mui/material';
import { CapacitorNotificationService } from '../services/capacitorNotificationService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

export const QuickNotificationTest: React.FC = () => {
  const testLocal = async () => {
    await CapacitorNotificationService.showLocalNotification('Test Local', 'This is a local notification test');
  };

  const testDirect = async () => {
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Direct Test',
        body: 'Direct LocalNotifications test',
        id: Math.floor(Math.random() * 1000000),
        schedule: { at: new Date(Date.now() + 100) }
      }]
    });
  };

  const checkPermissions = async () => {
    const push = await PushNotifications.checkPermissions();
    const local = await LocalNotifications.checkPermissions();
    alert(`Push: ${push.receive}\nLocal: ${local.display}`);
  };

  const showFCMToken = async () => {
    // Get FCM token for testing
    PushNotifications.addListener('registration', (token) => {
      alert(`FCM Token: ${token.value}`);
      console.log('FCM Token for testing:', token.value);
    });
    await PushNotifications.register();
  };

  return (
    <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
      <Button onClick={testLocal} variant="contained" size="small" sx={{ mr: 1 }}>
        Test Local
      </Button>
      <Button onClick={testDirect} variant="outlined" size="small" sx={{ mr: 1 }}>
        Direct Test
      </Button>
      <Button onClick={checkPermissions} variant="text" size="small" sx={{ mr: 1 }}>
        Check Perms
      </Button>
      <Button onClick={showFCMToken} variant="contained" color="secondary" size="small">
        Get FCM Token
      </Button>
    </Box>
  );
};
