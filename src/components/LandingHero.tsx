import React, { useState } from 'react';
import { Box, Typography, Button, Container, Card, CardContent, Chip } from '@mui/material';
import { Business, Security, Analytics, Phone, CheckCircle } from '@mui/icons-material';
import { ContactUsDialog, DemoDialog } from '../shared/ui/dialogs';

const LandingHero: React.FC = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <Box sx={{ 
      background: `
        linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%),
        url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: 'white', 
      py: 10,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        zIndex: 1
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Chip 
              label="🚀 Trusted by 500+ Hostels" 
              sx={{ 
                mb: 3, 
                bgcolor: 'rgba(255,255,255,0.25)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600
              }} 
            />
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 3, 
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                lineHeight: 1.2
              }}
            >
              Complete Hostel Management Solution
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 5, 
                opacity: 0.95,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                maxWidth: '600px'
              }}
            >
              Streamline operations, boost efficiency, and enhance tenant satisfaction with our all-in-one platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => setContactOpen(true)}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                  }
                }}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => setDemoOpen(true)}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Watch Demo
              </Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                { icon: <Business />, title: 'Room Management', desc: 'Track occupancy & availability' },
                { icon: <Security />, title: 'Secure Payments', desc: 'Digital payment processing' },
                { icon: <Analytics />, title: 'Smart Analytics', desc: 'Revenue & performance insights' },
                { icon: <Phone />, title: '24/7 Support', desc: 'Always here to help you' }
              ].map((feature, i) => (
                <Box key={i}>
                  <Card sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      {feature.icon}
                      <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
      
      <ContactUsDialog 
        open={contactOpen} 
        onClose={() => setContactOpen(false)} 
      />
      
      <DemoDialog 
        open={demoOpen} 
        onClose={() => setDemoOpen(false)} 
      />
    </Box>
  );
};

export default LandingHero;
