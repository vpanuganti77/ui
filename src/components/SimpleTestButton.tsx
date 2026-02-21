import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { SimpleNotificationService } from '../services/simpleNotificationService';

const SimpleTestButton: React.FC = () => {
  const handleTest = async () => {
    const result = await SimpleNotificationService.testNotification();
    console.log('Test result:', result);
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔔 Notification Test
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleTest}
        size="large"
      >
        TEST NOTIFICATION NOW
      </Button>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Click to test if notifications work on your device
      </Typography>
    </Box>
  );
};

export default SimpleTestButton;
