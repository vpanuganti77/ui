import React from 'react';
import { Button, Box, Typography, Stack, Alert } from '@mui/material';
import { socketService } from '../services/socketService';
import { NotificationService } from '../features/notifications/services/notificationService';

const NotificationDebugger: React.FC = () => {
  const [status, setStatus] = React.useState<string>('');

  const testComplaintNotification = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ API_BASE_URL: 'https://hostelmanagementbackend-production.up.railway.app/api' }));
      const apiBaseUrl = config.API_BASE_URL || 'https://hostelmanagementbackend-production.up.railway.app/api';
      
      setStatus('Sending test complaint notification...');
      
      const response = await fetch(`${apiBaseUrl}/notifications/complaint-created`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintTitle: 'Test Complaint',
          complaintCategory: 'maintenance',
          priority: 'high',
          tenantName: 'Test Tenant',
          room: '101',
          hostelId: user.hostelId
        })
      });
      
      if (response.ok) {
        setStatus('✅ Test complaint notification sent successfully');
      } else {
        setStatus(`❌ Failed to send notification: ${response.status}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  const testStatusUpdateNotification = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ API_BASE_URL: 'https://hostelmanagementbackend-production.up.railway.app/api' }));
      const apiBaseUrl = config.API_BASE_URL || 'https://hostelmanagementbackend-production.up.railway.app/api';
      
      setStatus('Sending test status update notification...');
      
      const response = await fetch(`${apiBaseUrl}/notifications/complaint-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: 'test-123',
          complaintTitle: 'Test Complaint',
          newStatus: 'resolved',
          updatedBy: user.name,
          hostelId: user.hostelId
        })
      });
      
      if (response.ok) {
        setStatus('✅ Test status update notification sent successfully');
      } else {
        setStatus(`❌ Failed to send notification: ${response.status}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  const checkWebSocketConnection = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    socketService.connect(user);
    setStatus('🔌 WebSocket connection initiated. Check console for details.');
  };

  const checkNotificationPermission = async () => {
    const permission = Notification.permission;
    const supported = NotificationService.isSupported();
    
    if (!supported) {
      setStatus('❌ Notifications not supported on this device');
      return;
    }
    
    if (permission === 'granted') {
      setStatus('✅ Notification permission granted');
      NotificationService.showNotification('Test', 'Notifications are working!');
    } else if (permission === 'denied') {
      setStatus('❌ Notification permission denied');
    } else {
      const granted = await NotificationService.requestPermission();
      setStatus(granted ? '✅ Permission granted' : '❌ Permission denied');
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>🔧 Notification Debugger</Typography>
      
      {status && (
        <Alert severity={status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'} sx={{ mb: 2 }}>
          {status}
        </Alert>
      )}
      
      <Stack spacing={2}>
        <Button variant="contained" onClick={checkNotificationPermission}>
          Check Notification Permission
        </Button>
        
        <Button variant="outlined" onClick={checkWebSocketConnection}>
          Test WebSocket Connection
        </Button>
        
        <Button variant="outlined" onClick={testComplaintNotification} color="primary">
          Test New Complaint Notification
        </Button>
        
        <Button variant="outlined" onClick={testStatusUpdateNotification} color="secondary">
          Test Status Update Notification
        </Button>
        
        <Typography variant="caption" color="text.secondary">
          Current Permission: {Notification.permission} | 
          Supported: {NotificationService.isSupported() ? 'Yes' : 'No'}
        </Typography>
      </Stack>
    </Box>
  );
};

export default NotificationDebugger;
