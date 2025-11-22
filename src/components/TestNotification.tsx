import React from 'react';
import { Button, Box, Typography, Stack } from '@mui/material';
import { API_CONFIG } from '../config/api';
import { socketService } from '../services/socketService';
import { NotificationService } from '../services/notificationService';
import { CapacitorNotificationService } from '../services/capacitorNotificationService';
import { Capacitor } from '@capacitor/core';

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

  const testLocalNotification = () => {
    NotificationService.showNotification(
      'Test Local Notification',
      'This is a test local notification to check if browser notifications work'
    );
  };

  const testSocketConnection = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Testing socket connection with user:', user);
      socketService.connect(user);
      
      // Send test notification after 2 seconds
      setTimeout(() => {
        (socketService as any).sendTestNotification();
      }, 2000);
    }
  };

  const checkNotificationPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      // Android/iOS
      await CapacitorNotificationService.initialize();
      console.log('Capacitor notifications initialized');
    } else {
      // Web
      console.log('Current notification permission:', Notification.permission);
      if (Notification.permission === 'default') {
        const granted = await NotificationService.requestPermission();
        console.log('Permission granted:', granted);
      }
    }
  };
  
  const testAndroidNotification = async () => {
    if (Capacitor.isNativePlatform()) {
      await CapacitorNotificationService.showLocalNotification(
        'Test Android Notification',
        'This is a test notification for Android app'
      );
    } else {
      NotificationService.showNotification(
        'Test Web Notification',
        'This is a test notification for web browser'
      );
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>🔔 Notification Debug Panel</Typography>
      <Stack spacing={2}>
        <Button 
          variant="contained" 
          onClick={testWebSocketNotification}
          color="primary"
        >
          Test WebSocket Notification
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testLocalNotification}
          color="secondary"
        >
          Test Local Notification
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testSocketConnection}
          color="info"
        >
          Test Socket Connection
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={checkNotificationPermission}
          color="warning"
        >
          {Capacitor.isNativePlatform() ? 'Initialize Android Notifications' : 'Check/Request Permission'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testAndroidNotification}
          color="success"
        >
          Test {Capacitor.isNativePlatform() ? 'Android' : 'Web'} Notification
        </Button>
        
        <Typography variant="caption" color="text.secondary">
          Platform: {Capacitor.isNativePlatform() ? 'Android' : 'Web'} | 
          Permission: {Capacitor.isNativePlatform() ? 'Check console' : Notification.permission} | 
          Supported: {NotificationService.isSupported() ? 'Yes' : 'No'}
        </Typography>
      </Stack>
    </Box>
  );
};

export default TestNotification;