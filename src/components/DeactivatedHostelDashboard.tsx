import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Warning, ContactSupport } from '@mui/icons-material';

const DeactivatedHostelDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mt: { xs: 2, sm: 4 }, textAlign: 'center' }}>
        <Card 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 },
            mx: { xs: 0, sm: 'auto' },
            borderRadius: { xs: 2, sm: 3 }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
            <Warning sx={{ 
              fontSize: { xs: 48, sm: 64 }, 
              color: 'warning.main', 
              mb: { xs: 1.5, sm: 2 } 
            }} />
            
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700, 
                mb: { xs: 1.5, sm: 2 }, 
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}
            >
              Account Deactivated
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              Your hostel account has been temporarily deactivated by the master administrator.
              {!isMobile && ' All management features have been disabled.'}
            </Typography>
            
            <Alert 
              severity="warning" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                textAlign: 'left',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant={isMobile ? "caption" : "body2"}>
                <strong>Restricted Features:</strong><br/>
                • Tenant management disabled<br/>
                • Payment processing blocked<br/>
                • Room management restricted<br/>
                {!isMobile && '• Reports and data export unavailable'}<br/>
                {!isMobile && '• Tenants can still access their accounts normally'}
              </Typography>
            </Alert>
            
            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Contact the master administrator to reactivate your account.
            </Typography>
            
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              startIcon={<ContactSupport />}
              fullWidth={isMobile}
              sx={{ 
                mt: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: { xs: 1, sm: 1.5 }
              }}
              onClick={() => {
                window.location.href = 'tel:+919908227236';
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
