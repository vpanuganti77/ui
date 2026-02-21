import React from 'react';
import { Box, Typography, Fade, Zoom } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface SuccessAnimationProps {
  message: string;
  show: boolean;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ message, show }) => {
  return (
    <Fade in={show} timeout={500}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 4,
        textAlign: 'center'
      }}>
        <Zoom in={show} timeout={800}>
          <CheckCircle sx={{ 
            fontSize: 80, 
            color: 'success.main',
            filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))',
            animation: 'pulse 2s infinite'
          }} />
        </Zoom>
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: 'success.main' }}>
          {message}
        </Typography>
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}
        </style>
      </Box>
    </Fade>
  );
};

export default SuccessAnimation;
