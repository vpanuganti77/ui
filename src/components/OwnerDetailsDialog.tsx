import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { Close, Person, Email, Phone, Business, CheckCircle, Warning } from '@mui/icons-material';

interface OwnerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  hostel: {
    name: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    adminUserId: string | null;
    id: string;
  } | null;
}

const OwnerDetailsDialog: React.FC<OwnerDetailsDialogProps> = ({
  open,
  onClose,
  hostel
}) => {
  if (!hostel) return null;

  const hasUserAccount = !!hostel.adminUserId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" />
          <Typography variant="h6">Owner Details</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Hostel Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {hostel.name}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Person color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="text.secondary">
              Owner Information
            </Typography>
            <Chip
              icon={hasUserAccount ? <CheckCircle /> : <Warning />}
              label={hasUserAccount ? "User Account Exists" : "No User Account"}
              color={hasUserAccount ? "success" : "warning"}
              size="small"
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ pl: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              {hostel.adminName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Email:
              </Typography>
              <Typography variant="body2">
                {hostel.adminEmail}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Phone:
              </Typography>
              <Typography variant="body2">
                {hostel.adminPhone}
              </Typography>
            </Box>
          </Box>
        </Box>

        {!hasUserAccount && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'warning.light', 
            borderRadius: 1, 
            border: '1px solid',
            borderColor: 'warning.main'
          }}>
            <Typography variant="body2" color="warning.dark">
              <strong>Note:</strong> This hostel owner doesn't have a user account in the system. 
              Some features like password reset may not be available. Consider creating a user account 
              for this owner to enable full functionality.
            </Typography>
          </Box>
        )}

        {hasUserAccount && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'success.light', 
            borderRadius: 1, 
            border: '1px solid',
            borderColor: 'success.main'
          }}>
            <Typography variant="body2" color="success.dark">
              <strong>User Account ID:</strong> {hostel.adminUserId}
            </Typography>
            <Typography variant="body2" color="success.dark" sx={{ mt: 0.5 }}>
              This owner has a valid user account and can access all system features.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OwnerDetailsDialog;
