import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Container,
} from '@mui/material';
import { Warning, ContactSupport } from '@mui/icons-material';

const DeactivatedHostelDashboard: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Card elevation={3} sx={{ p: 4 }}>
          <CardContent>
            <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Hostel Account Deactivated
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Your hostel account has been temporarily deactivated by the master administrator.
              All management features have been disabled.
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>What this means:</strong><br/>
                • You cannot add, edit, or manage tenants<br/>
                • Payment processing is disabled<br/>
                • Room management is restricted<br/>
                • Reports and data export are unavailable<br/>
                • Tenants can still access their accounts normally
              </Typography>
            </Alert>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              If you believe this is an error or need to reactivate your account, 
              please contact the master administrator immediately.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<ContactSupport />}
              sx={{ mt: 2 }}
              onClick={() => {
                window.location.href = 'mailto:admin@pgflow.com?subject=Hostel Account Reactivation Request';
              }}
            >
              Contact Master Admin
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DeactivatedHostelDashboard;