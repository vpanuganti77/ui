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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const setupSteps = [
    { label: 'Account Created', completed: true },
    { label: 'Setup Request Submitted', completed: true },
    { label: 'Under Review', completed: false, current: true },
    { label: 'Approval & Activation', completed: false },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2, mb: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <HourglassEmpty sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.primary">
            Setup Pending Approval
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Welcome {user?.name}! Your hostel setup is being reviewed.
          </Typography>
        </Box>

        <Card sx={{ mb: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Schedule color="info" />
              <Typography variant="h6" color="info.dark">
                Setup Progress
              </Typography>
            </Stack>
            
            <Box sx={{ mb: 3 }}>
              {setupSteps.map((step, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <CheckCircle 
                    color={step.completed ? 'success' : step.current ? 'warning' : 'disabled'} 
                  />
                  <Typography 
                    variant="body1" 
                    color={step.completed ? 'success.main' : step.current ? 'warning.main' : 'text.disabled'}
                    sx={{ fontWeight: step.current ? 600 : 400 }}
                  >
                    {step.label}
                  </Typography>
                  {step.current && (
                    <Chip label="In Progress" color="warning" size="small" />
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

        <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Email color="primary" sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                What happens next?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Our team is reviewing your hostel setup request for <strong>{user?.hostelName}</strong>. 
                This typically takes 24-48 hours. You will receive an email notification once approved.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Account verification and validation<br />
                • Hostel information review<br />
                • System setup and configuration<br />
                • Approval and activation
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<ContactSupport />}
            onClick={() => setContactOpen(true)}
            size="large"
          >
            Contact Support
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            size="large"
          >
            Logout
          </Button>
        </Stack>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Need immediate assistance?</strong><br />
            Email: support@hostelpro.com | Phone: +91-XXXX-XXXXXX
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