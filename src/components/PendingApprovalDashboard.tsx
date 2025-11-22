import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  HourglassEmpty, 
  ContactSupport, 
  ExitToApp, 
  CheckCircle,
  Schedule,
  Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SupportTicketDialog from './SupportTicketDialog';

const PendingApprovalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const setupSteps = [
    { label: 'Setup Request Submitted', completed: true },
    { label: 'Account Created', completed: true },
    { label: 'Under Admin Review', completed: false, current: true },
    { label: 'Approval & Activation', completed: false },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
          <HourglassEmpty sx={{ fontSize: { xs: 60, sm: 80 }, color: 'warning.main', mb: { xs: 1.5, sm: 2 } }} />
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {isMobile ? 'Approval Pending' : 'Hostel Setup - Approval Pending'}
          </Typography>
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
            Welcome {user?.name}! Track your hostel setup approval status below.
          </Typography>
        </Box>

        <Card sx={{ mb: { xs: 2, sm: 3 }, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Schedule color="info" />
              <Typography variant={isMobile ? "subtitle1" : "h6"} color="info.dark">
                Setup Progress
              </Typography>
            </Stack>
            
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              {setupSteps.map((step, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <CheckCircle 
                    color={step.completed ? 'success' : step.current ? 'warning' : 'disabled'}
                    sx={{ fontSize: { xs: 20, sm: 24 } }}
                  />
                  <Typography 
                    variant={isMobile ? "body2" : "body1"}
                    color={step.completed ? 'success.main' : step.current ? 'warning.main' : 'text.disabled'}
                    sx={{ fontWeight: step.current ? 600 : 400, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    {step.label}
                  </Typography>
                  {step.current && (
                    <Chip label="In Progress" color="warning" size={isMobile ? "small" : "small"} />
                  )}
                </Stack>
              ))}
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={50} 
              sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              50% Complete
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mb: { xs: 3, sm: 4 }, p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "center" : "flex-start"}>
            <Email color="primary" sx={{ mt: 0.5, fontSize: { xs: 20, sm: 24 } }} />
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant={isMobile ? "subtitle2" : "body1"} sx={{ fontWeight: 600, mb: 1 }}>
                Approval Status Tracking
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Your setup request for <strong>{user?.hostelName}</strong> is under review. 
                You can track the approval progress here. Typically takes 24-48 hours.
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                • Account verification<br />
                • Information review<br />
                • System setup<br />
                • Approval & activation
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<ContactSupport />}
            onClick={() => setContactOpen(true)}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Contact Support
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Logout
          </Button>
        </Stack>

        <Box sx={{ mt: { xs: 3, sm: 4 }, p: { xs: 1.5, sm: 2 }, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            <strong>Need immediate assistance?</strong><br />
            {isMobile ? 'support@hostelpro.com' : 'Email: support@hostelpro.com | Phone: +91-XXXX-XXXXXX'}
          </Typography>
        </Box>
      </Paper>
      
      <SupportTicketDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </Box>
  );
};

export default PendingApprovalDashboard;