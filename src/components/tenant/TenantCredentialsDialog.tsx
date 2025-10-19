import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import { ContentCopy, Launch } from '@mui/icons-material';

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
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenLoginUrl = () => {
    if (credentials?.loginUrl) {
      window.open(credentials.loginUrl, '_blank');
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
        <Alert severity="success" sx={{ mb: 2 }}>
          User account has been automatically created for {tenantName}
        </Alert>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Login Email:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={credentials.email}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
            />
            <IconButton
              onClick={() => handleCopyToClipboard(credentials.email)}
              size="small"
              title="Copy email"
            >
              <ContentCopy />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Password:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={credentials.password}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
            />
            <IconButton
              onClick={() => handleCopyToClipboard(credentials.password)}
              size="small"
              title="Copy password"
            >
              <ContentCopy />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Direct Login Link:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={credentials.loginUrl}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <IconButton
                onClick={() => handleCopyToClipboard(credentials.loginUrl)}
                size="small"
                title="Copy login URL"
              >
                <ContentCopy />
              </IconButton>
              <IconButton
                onClick={handleOpenLoginUrl}
                size="small"
                title="Open login URL"
              >
                <Launch />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Alert severity="info">
          Share these credentials with the tenant. They can use the direct login link to access their account without entering username and password.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantCredentialsDialog;