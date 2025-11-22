import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Capacitor } from '@capacitor/core';

const SimpleNetworkTest: React.FC = () => {
  const [result, setResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testBasicConnectivity = async () => {
    setTesting(true);
    setResult('Testing...');
    
    try {
      // Test 1: Basic internet connectivity
      const testGoogle = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      setResult(prev => prev + '\n✅ Internet: Connected');
      
      // Test 2: Railway API with simple GET
      try {
        const apiResponse = await fetch('http://192.168.0.138:5000/api', {
          method: 'GET',
          mode: 'cors'
        });
        setResult(prev => prev + `\n✅ Railway API: ${apiResponse.status}`);
      } catch (apiError: any) {
        setResult(prev => prev + `\n❌ Railway API: ${apiError.message}`);
      }
      
      // Test 3: Try login endpoint
      try {
        const loginResponse = await fetch('http://192.168.0.138:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test', password: 'test' })
        });
        setResult(prev => prev + `\n✅ Login endpoint: ${loginResponse.status}`);
      } catch (loginError: any) {
        setResult(prev => prev + `\n❌ Login endpoint: ${loginError.message}`);
      }
      
    } catch (error: any) {
      setResult(prev => prev + `\n❌ Basic connectivity failed: ${error.message}`);
    }
    
    setTesting(false);
  };

  const testWithXHR = async () => {
    setTesting(true);
    setResult('Testing with XMLHttpRequest...');
    
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://192.168.0.138:5000/api', true);
      xhr.timeout = 10000;
      
      xhr.onload = () => {
        setResult(prev => prev + `\n✅ XHR Success: ${xhr.status} ${xhr.statusText}`);
        setTesting(false);
        resolve(true);
      };
      
      xhr.onerror = () => {
        setResult(prev => prev + `\n❌ XHR Error: Network error`);
        setTesting(false);
        resolve(false);
      };
      
      xhr.ontimeout = () => {
        setResult(prev => prev + `\n❌ XHR Timeout: Request timed out`);
        setTesting(false);
        resolve(false);
      };
      
      try {
        xhr.send();
      } catch (error: any) {
        setResult(prev => prev + `\n❌ XHR Exception: ${error.message}`);
        setTesting(false);
        resolve(false);
      }
    });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Simple Network Test
      </Typography>
      
      <Typography variant="body2" gutterBottom>
        Platform: {Capacitor.isNativePlatform() ? 'Native Android' : 'Web Browser'}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={testBasicConnectivity}
          disabled={testing}
          size="small"
        >
          Test Fetch API
        </Button>
        <Button 
          variant="contained" 
          onClick={testWithXHR}
          disabled={testing}
          size="small"
        >
          Test XMLHttpRequest
        </Button>
      </Box>
      
      {result && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result}
          </pre>
        </Alert>
      )}
    </Box>
  );
};

export default SimpleNetworkTest;