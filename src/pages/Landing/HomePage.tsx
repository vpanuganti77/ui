import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Business,
  People,
  Payment,
  Analytics,
  Security,
  CloudSync,
  Menu as MenuIcon,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const features = [
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Tenant Management',
      description: 'Comprehensive tenant profiles, room assignments, and occupancy tracking'
    },
    {
      icon: <Payment sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Payment Processing',
      description: 'Automated rent collection, payment tracking, and financial reporting'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Analytics & Reports',
      description: 'Real-time insights, occupancy rates, and revenue analytics'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Reliable',
      description: 'Role-based access control and secure data management'
    },
    {
      icon: <CloudSync sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Cloud Sync',
      description: 'Real-time data synchronization across all devices'
    },
    {
      icon: <Business sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Multi-Property',
      description: 'Manage multiple hostels and PG accommodations from one dashboard'
    }
  ];

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Business sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              PGFlow
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>Services</MenuItem>
                <MenuItem onClick={handleMenuClose}>About</MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); scrollToContact(); }}>Contact</MenuItem>

                <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>Login</MenuItem>
              </Menu>
            </>
          ) : (
            <Box display="flex" gap={3} alignItems="center">
              <Button color="inherit">Services</Button>
              <Button color="inherit">About</Button>
              <Button color="inherit" onClick={scrollToContact}>Contact</Button>
              <Button variant="contained" onClick={() => navigate('/login')}>
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: 12,
          pb: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Streamline Your PG & Hostel Management
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
            Complete solution for managing tenants, payments, and operations with ease
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button 
              variant="contained" 
              size="large" 
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ borderColor: 'white', color: 'white' }}
              onClick={scrollToContact}
            >
              Setup Your Hostel
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" sx={{ mb: 2, fontWeight: 700 }}>
          Why Choose PGFlow?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to manage your PG and hostel business efficiently
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)' }
              }}
            >
              <CardContent>
                <Box mb={2}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 4, textAlign: 'center' }}>
            <Box>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Properties Managed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                10K+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Tenants Served
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                99.9%
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Uptime
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                24/7
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Support
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Contact Section */}
      <Container id="contact-section" maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" sx={{ mb: 6, fontWeight: 700 }}>
          Get In Touch
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, justifyItems: 'center' }}>
          <Box textAlign="center">
            <Phone sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Call Us</Typography>
            <Typography color="text.secondary">+91 9908227236</Typography>
          </Box>
          <Box textAlign="center">
            <Email sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Email Us</Typography>
            <Typography color="text.secondary">vpanuganti13@gmail.com</Typography>
          </Box>
          <Box textAlign="center">
            <LocationOn sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Visit Us</Typography>
            <Typography color="text.secondary">Hyderabad, India</Typography>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Business sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  PGFlow
                </Typography>
              </Box>
              <Typography color="grey.400">
                Streamlining PG and hostel management with modern technology and intuitive design.
              </Typography>
            </Box>
            <Box textAlign={{ xs: 'left', md: 'right' }}>
              <Typography variant="body2" color="grey.400">
                © 2024 PGFlow. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;