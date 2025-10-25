import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Container,
  Stack,
} from '@mui/material';
import { Warning, ContactSupport, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SupportTicketDialog from '../components/SupportTicketDialog';
import PendingApprovalDashboard from '../components/PendingApprovalDashboard';

interface RestrictedAccessProps {
  reason: 'user_deleted' | 'hostel_deleted' | 'hostel_inactive' | 'user_inactive' | 'hostel_pending';
  message: string;
}

const RestrictedAccess: React.FC<RestrictedAccessProps> = ({ reason, message }) => {
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleContactSupport = () => {
    setContactOpen(true);
  };

  const getTitle = () => {
    switch (reason) {
      case 'user_deleted':
        return 'Account Not Found';
      case 'user_inactive':
        return 'Account Deactivated';
      case 'hostel_deleted':
        return 'Hostel Removed';
      case 'hostel_inactive':
        return 'Hostel Deactivated';
      default:
        return 'Access Restricted';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'user_deleted':
        return 'Your user account has been removed from the system.';
      case 'user_inactive':
        return 'Your user account has been temporarily deactivated.';
      case 'hostel_deleted':
        return 'Your hostel has been removed from the system.';
      case 'hostel_inactive':
        return 'Your hostel has been temporarily deactivated.';
      default:
        return 'You do not have access to this application.';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Warning sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.primary">
            {getTitle()}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {getDescription()}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body1">
            {message}
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" color="text.secondary">
            If you believe this is an error or need to restore access, please contact our support team.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<ContactSupport />}
            onClick={handleContactSupport}
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

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Need Help?</strong><br />
            Email: support@hostelpro.com<br />
            Phone: +91-XXXX-XXXXXX
          </Typography>
        </Box>
      </Paper>
      
      <SupportTicketDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </Container>
  );
};

export default RestrictedAccess;