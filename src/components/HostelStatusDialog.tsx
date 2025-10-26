import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';

interface HostelStatusDialogProps {
  open: boolean;
  title: string;
  message: string;
  isActivated: boolean;
  onConfirm: () => void;
}

const HostelStatusDialog: React.FC<HostelStatusDialogProps> = ({
  open,
  title,
  message,
  isActivated,
  onConfirm
}) => {
  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
      onClose={() => {}} // Prevent closing
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {isActivated ? (
            <CheckCircle color="success" sx={{ fontSize: 32 }} />
          ) : (
            <Warning color="error" sx={{ fontSize: 32 }} />
          )}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Alert 
          severity={isActivated ? 'success' : 'error'} 
          sx={{ mb: 2 }}
        >
          <Typography variant="body1">
            {message}
          </Typography>
        </Alert>
        
        <Typography variant="body2" color="text.secondary">
          Click "Refresh" to continue with updated access.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          variant="contained" 
          color={isActivated ? 'success' : 'error'}
          size="large"
          onClick={onConfirm}
          sx={{ minWidth: 120 }}
        >
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HostelStatusDialog;