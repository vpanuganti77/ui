import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Chip } from '@mui/material';
import { API_CONFIG } from '../config/api';
import { CapacitorHttpService } from '../services/capacitorHttpService';
import { Capacitor } from '@capacitor/core';

const NetworkDebugger: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiUrl, setApiUrl] = useState('');
  const [error, setError] = useState('');

  const checkApiConnection = async () => {
    setApiStatus('checking');
    setError('');
    
    try {
      await API_CONFIG.loadConfig();
      const baseUrl = API_CONFIG.BASE_URL;
      setApiUrl(baseUrl);
      
      console.log('Testing API connection to:', baseUrl);
      
      // Try multiple endpoints to test connectivity
      const testUrls = [
        `${baseUrl}/health`,
        `${baseUrl}/auth/login`,
        baseUrl
      ];
      
      let lastError = '';
      
      for (const url of testUrls) {
        try {
          console.log('Testing URL:', url);
          const response = Capacitor.isNativePlatform()
            ? await CapacitorHttpService.request(url, {
                method: url.includes('/login') ? 'POST' : 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: url.includes('/login') ? JSON.stringify({ test: true }) : undefined,
              })
            : await fetch(url, {
                method: url.includes('/login') ? 'POST' : 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: url.includes('/login') ? JSON.stringify({ test: true }) : undefined,
              });
          
          console.log(`Response from ${url}:`, response.status, response.statusText);
          
          if (response.status < 500) { // Any response except server error means connection works
            setApiStatus('online');
            return;
          }
          lastError = `${response.status} ${response.statusText}`;
        } catch (err: any) {
          console.error(`Failed to connect to ${url}:`, err);
          lastError = err.message;
        }
      }
      
      setApiStatus('offline');
      setError(lastError || 'All connection attempts failed');
    } catch (err: any) {
      setApiStatus('offline');
      setError(err.message || 'Network error');
      console.error('API connection test failed:', err);
    }
  };

  useEffect(() => {
    checkApiConnection();
  }, []);

  const testLogin = async () => {
    try {
      const baseUrl = API_CONFIG.BASE_URL;
      console.log('Testing login to:', `${baseUrl}/auth/login`);
      
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'master@hostel.com', 
          password: 'master123' 
        }),
      });
      
      const data = await response.json();
      console.log('Login test response:', data);
      
      if (response.ok) {
        alert('Login test successful!');
      } else {
        alert(`Login test failed: ${data.message || response.status}`);
      }
    } catch (err: any) {
      alert(`Login test error: ${err.message}`);
      console.error('Login test failed:', err);
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Network Debug Info
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          API URL: {apiUrl || 'Loading...'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2">API Status:</Typography>
          <Chip 
            label={apiStatus} 
            color={apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'error' : 'default'}
            size="small"
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          onClick={checkApiConnection}
          size="small"
        >
          Test API Connection
        </Button>
        <Button 
          variant="contained" 
          onClick={testLogin}
          size="small"
        >
          Test Login
        </Button>
      </Box>
    </Box>
  );
};

export default NetworkDebugger;