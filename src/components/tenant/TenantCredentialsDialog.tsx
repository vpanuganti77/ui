import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';

interface TenantCredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    password: string;
    loginUrl: string;
  } | null;
  tenantName: string;
}

const TenantCredentialsDialog: React.FC<TenantCredentialsDialogProps> = ({
  open,
  onClose,
  credentials,
  tenantName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!credentials) return;

    const credentialsText = `
Hostel Management System - Tenant Login Credentials

Tenant Name: ${tenantName}
Email: ${credentials.email}
Password: ${credentials.password}

Login URL: ${credentials.loginUrl}

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

  if (!credentials) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Tenant Account Created Successfully
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          Tenant account has been created successfully! Please share these credentials with {tenantName}.
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
                Tenant Name:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {tenantName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Email (Username):
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {credentials.email}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Password:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                {credentials.password}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Login URL:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1, wordBreak: 'break-all' }}>
                {credentials.loginUrl}
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
          Please share these credentials securely with the tenant. They should change the password after first login.
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

export default TenantCredentialsDialog;