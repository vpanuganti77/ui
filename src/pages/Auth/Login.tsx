import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Fab,
  Tooltip
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ContactUsDialog from '../../components/ContactUsDialog';
import QuickAuthDialog from '../../components/QuickAuthDialog';
import { ArrowBack, Visibility, VisibilityOff, Fingerprint } from '@mui/icons-material';
import { BiometricService } from '../../services/biometricService';
import { FEATURE_FLAGS } from '../../config/features';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [quickAuthOpen, setQuickAuthOpen] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [hasQuickAuth, setHasQuickAuth] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check for quick auth availability
  useEffect(() => {
    const checkQuickAuth = () => {
      const quickAuthAvailable = BiometricService.isPINSet() || BiometricService.isBiometricEnabled();
      setHasQuickAuth(quickAuthAvailable);
    };
    checkQuickAuth();
  }, []);

  // Load saved credentials and handle auto-login on component mount
  useEffect(() => {
    if (autoLoginAttempted) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    const urlPassword = urlParams.get('password');
    
    if (urlEmail && urlPassword && !autoLoginAttempted) {
      setAutoLoginAttempted(true);
      try {
        const decodedEmail = decodeURIComponent(urlEmail);
        const decodedPassword = decodeURIComponent(urlPassword);
        setEmail(decodedEmail);
        setPassword(decodedPassword);
        
        // Clear URL parameters to prevent re-execution
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Auto-submit the form
        login(decodedEmail, decodedPassword).then(() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const roleMap: Record<string, string> = {
            'master_admin': '/master-admin/dashboard',
            'admin': '/admin/dashboard',
            'receptionist': '/admin/dashboard', 
            'tenant': '/tenant/dashboard'
          };
          const redirectPath = roleMap[user.role] || '/admin/dashboard';
          navigate(redirectPath, { replace: true });
        }).catch((err) => {
          setError('Auto-login failed. Please try manually.');
        });
        return;
      } catch (error) {
        setError('Invalid login link');
      }
    }
    
    // Only load saved credentials if not auto-login
    if (!urlEmail && !urlPassword) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const savedPassword = localStorage.getItem('rememberedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, [login, navigate, autoLoginAttempted]);

  const validateForm = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (!password.trim()) return 'Password is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      await login(email, password);
      
      // Navigation will be handled by the auth context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const roleMap: Record<string, string> = {
        'master_admin': '/master-admin/dashboard',
        'admin': '/admin/dashboard', 
        'receptionist': '/admin/dashboard',
        'tenant': '/tenant/dashboard'
      };
      const redirectPath = roleMap[user.role] || '/admin/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      let errorMessage = err.message || 'Login failed';
      
      // Handle specific error cases
      if (err.status === 423) {
        // Account locked
        errorMessage = err.message;
      } else if (err.attemptsRemaining !== undefined) {
        // Failed login with attempts remaining
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Crect width="11" height="11" rx="2"/%3E%3Crect x="20" width="11" height="11" rx="2"/%3E%3Crect x="40" width="11" height="11" rx="2"/%3E%3Crect y="20" width="11" height="11" rx="2"/%3E%3Crect x="20" y="20" width="11" height="11" rx="2"/%3E%3Crect x="40" y="20" width="11" height="11" rx="2"/%3E%3Crect y="40" width="11" height="11" rx="2"/%3E%3Crect x="20" y="40" width="11" height="11" rx="2"/%3E%3Crect x="40" y="40" width="11" height="11" rx="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={24} sx={{ 
          padding: 4, 
          width: '100%',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 32 32" fill="white">
                <rect x="6" y="8" width="20" height="16" rx="2" fill="white"/>
                <rect x="8" y="10" width="4" height="3" fill="#1976d2"/>
                <rect x="14" y="10" width="4" height="3" fill="#1976d2"/>
                <rect x="20" y="10" width="4" height="3" fill="#1976d2"/>
                <rect x="8" y="15" width="4" height="3" fill="#1976d2"/>
                <rect x="14" y="15" width="4" height="3" fill="#1976d2"/>
                <rect x="20" y="15" width="4" height="3" fill="#1976d2"/>
                <rect x="8" y="20" width="4" height="2" fill="#1976d2"/>
                <rect x="14" y="20" width="4" height="2" fill="#1976d2"/>
                <rect x="20" y="20" width="4" height="2" fill="#1976d2"/>
              </svg>
            </Box>
            <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
              Hostel Management
            </Typography>
            <Typography component="h2" variant="h6" align="center" gutterBottom sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Hostel & Co-Living Management System
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ mt: 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            {FEATURE_FLAGS.QUICK_AUTH_ENABLED && hasQuickAuth && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Fingerprint />}
                onClick={() => setQuickAuthOpen(true)}
                sx={{ mb: 2 }}
              >
                Quick Login
              </Button>
            )}
            
            <Box textAlign="center">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setContactOpen(true)}
                sx={{ mb: 2 }}
              >
                Setup Your Hostel
              </Button>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ mt: 1 }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>

          <ContactUsDialog
            open={contactOpen}
            onClose={() => setContactOpen(false)}
          />
          
          <QuickAuthDialog
            open={quickAuthOpen}
            onClose={() => setQuickAuthOpen(false)}
            onAuthenticate={login}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;