import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { SimpleNotificationService } from '../services/simpleNotificationService';

const AndroidNotificationTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const isAndroid = Capacitor.isNativePlatform();

  const testNotification = async () => {
    setStatus('Testing...');
    try {
      // Test notification directly
      const success = await SimpleNotificationService.testNotification();
      
      if (success) {
        setStatus('✅ Notification sent! Check your notification tray.');
      } else {
        setStatus('❌ Failed to send notification');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  if (!isAndroid) {
    return null; // Don't show on web
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>📱 Android Notification Test</Typography>
      
      {status && (
        <Alert 
          severity={status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'} 
          sx={{ mb: 2 }}
        >
          {status}
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        onClick={testNotification}
        sx={{ mb: 2 }}
      >
        🧪 Test Android Notification
      </Button>
      
      <Typography variant="caption" color="text.secondary" display="block">
        Platform: Android (Native) | Plugin: LocalNotifications
      </Typography>
    </Box>
  );
};

export default AndroidNotificationTest;