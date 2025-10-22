import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';

interface UserCredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  userDetails: {
    name: string;
    email: string;
    password: string;
    hostelName: string;
    role: string;
    loginUrl?: string;
  } | null;
}

const UserCredentialsDialog: React.FC<UserCredentialsDialogProps> = ({
  open,
  onClose,
  userDetails
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!userDetails) return;

    const credentialsText = `
Hostel Management System - Login Credentials

Hostel: ${userDetails.hostelName}
Name: ${userDetails.name}
Email: ${userDetails.email}
Password: ${userDetails.password}
Role: ${userDetails.role}

Login URL: ${userDetails.loginUrl || `${window.location.origin}/login`}

Please keep these credentials safe and change the password after first login.
    `.trim();

    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!userDetails) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircle color="success" />
          User Created Successfully
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          Admin user has been created successfully! Please share these credentials with the hostel admin.
        </Alert>

        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            bgcolor: 'grey.50', 
            border: '1px solid', 
            borderColor: 'grey.200',
            position: 'relative'
          }}
        >
          <IconButton
            onClick={handleCopyToClipboard}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              bgcolor: copied ? 'success.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: copied ? 'success.dark' : 'primary.dark'
              }
            }}
            size="small"
          >
            {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>

          <Typography variant="h6" gutterBottom sx={{ pr: 5 }}>
            Login Credentials
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Hostel Name:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {userDetails.hostelName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Admin Name:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {userDetails.name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Email (Username):
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {userDetails.email}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Password:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {userDetails.password}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Role:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {userDetails.role}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Login URL:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1, wordBreak: 'break-all' }}>
                {userDetails.loginUrl || `${window.location.origin}/login`}
              </Typography>
            </Box>
          </Box>

          {copied && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Credentials copied to clipboard!
            </Alert>
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please share these credentials securely with the hostel admin. They should change the password after first login.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCopyToClipboard} variant="outlined" startIcon={<ContentCopy />}>
          Copy Credentials
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserCredentialsDialog;