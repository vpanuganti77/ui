import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Close, Dashboard, People, Payment, Analytics, ArrowBack, ArrowForward } from '@mui/icons-material';

interface DemoDialogProps {
  open: boolean;
  onClose: () => void;
}

const demoSteps = [
  {
    label: 'Dashboard Overview',
    icon: <Dashboard />,
    title: 'Real-time Dashboard',
    description: 'Get instant insights into occupancy, revenue, and key metrics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
  },
  {
    label: 'Tenant Management',
    icon: <People />,
    title: 'Manage Tenants Easily',
    description: 'Add, edit, and track tenant information with digital documents',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop'
  },
  {
    label: 'Payment Processing',
    icon: <Payment />,
    title: 'Automated Payments',
    description: 'Track rent, generate receipts, and manage payment history',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'
  },
  {
    label: 'Analytics & Reports',
    icon: <Analytics />,
    title: 'Smart Analytics',
    description: 'Generate detailed reports and track business performance',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
  }
];

const DemoDialog: React.FC<DemoDialogProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % demoSteps.length);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          🎬 Product Demo
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            {demoSteps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ flex: 1, position: 'relative', mx: 3 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                height: 250,
                backgroundImage: `url(${demoSteps[activeStep].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)'
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
                {React.cloneElement(demoSteps[activeStep].icon, { sx: { fontSize: 50, mb: 1 } })}
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {demoSteps[activeStep].title}
                </Typography>
              </Box>
              
              <IconButton
                onClick={handlePrev}
                disabled={activeStep === 0}
                sx={{
                  position: 'absolute',
                  left: 16,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  '&:disabled': { opacity: 0.3 }
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <IconButton
                onClick={handleNext}
                disabled={activeStep === demoSteps.length - 1}
                sx={{
                  position: 'absolute',
                  right: 16,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  '&:disabled': { opacity: 0.3 }
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>
            
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {demoSteps[activeStep].title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {demoSteps[activeStep].description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {activeStep + 1} of {demoSteps.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close Demo
        </Button>
        <Button variant="contained" onClick={onClose}>
          Start Free Trial
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DemoDialog;