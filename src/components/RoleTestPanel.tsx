import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { Login, SupervisorAccount, Person, PersonPin } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const RoleTestPanel: React.FC = () => {
  const { login } = useAuth();

  const testUsers = [
    {
      role: 'Master Admin',
      email: 'master@hostel.com',
      password: 'demo123',
      description: 'Full system access, manages all hostels',
      icon: <SupervisorAccount />,
      color: 'error' as const,
      features: ['Create Hostels', 'Manage All Users', 'System Settings']
    },
    {
      role: 'Admin',
      email: 'admin@hostel.com', 
      password: 'demo123',
      description: 'Full hostel management access',
      icon: <Person />,
      color: 'primary' as const,
      features: ['Manage Tenants', 'Financial Reports', 'Staff Management', 'All Operations']
    },
    {
      role: 'Receptionist',
      email: 'receptionist@hostel.com',
      password: 'demo123', 
      description: 'Limited operational access',
      icon: <PersonPin />,
      color: 'secondary' as const,
      features: ['Add Tenants', 'Record Payments', 'Handle Complaints', 'View Rooms']
    },
    {
      role: 'Tenant',
      email: 'tenant@hostel.com',
      password: 'demo123',
      description: 'Personal dashboard and complaints',
      icon: <Login />,
      color: 'success' as const,
      features: ['View Room Details', 'Payment History', 'Submit Complaints', 'View Notices']
    }
  ];

  const handleTestLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      console.log('Login successful for:', email);
    } catch (error) {
      console.error('Login failed for:', email, error);
      alert(`Login failed for ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Role-Based Access Testing
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {testUsers.map((user) => (
          <Box key={user.email} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
            <Card 
              sx={{ 
                height: '100%',
                border: 2,
                borderColor: `${user.color}.main`,
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box sx={{ color: `${user.color}.main` }}>
                    {user.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user.role}
                  </Typography>
                  <Chip 
                    label={user.role.toLowerCase().replace(' ', '_')} 
                    color={user.color}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {user.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Access Features:
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {user.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                    Email: {user.email}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                    Password: {user.password}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  color={user.color}
                  fullWidth
                  startIcon={<Login />}
                  onClick={() => handleTestLogin(user.email, user.password)}
                  sx={{ fontWeight: 600 }}
                >
                  Login as {user.role}
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.50', borderRadius: 2, border: 1, borderColor: 'info.200' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
          Testing Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>Click any "Login as [Role]" button above</li>
            <li>You'll be automatically logged in and redirected to the appropriate dashboard</li>
            <li>Explore the navigation menu to see role-specific access</li>
            <li>Try accessing different features to test permissions</li>
            <li>Logout and try a different role to compare access levels</li>
          </ol>
        </Typography>
      </Box>
    </Box>
  );
};

export default RoleTestPanel;
