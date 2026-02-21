import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { getAll, create, update } from '../shared/services/storage/fileDataService';

interface HostelSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  hostelId: string;
}

const HostelSettingsDialog: React.FC<HostelSettingsDialogProps> = ({
  open,
  onClose,
  hostelId
}) => {
  const [noticePeriod, setNoticePeriod] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (open && hostelId) {
      loadSettings();
    }
  }, [open, hostelId]);

  const loadSettings = async () => {
    try {
      const settings = await getAll('hostelSettings');
      const hostelSettings = settings.find(s => s.hostelId === hostelId);
      
      if (hostelSettings) {
        setNoticePeriod(hostelSettings.noticePeriod || 30);
        setSettingsId(hostelSettings.id);
      } else {
        setNoticePeriod(30);
        setSettingsId(null);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleSave = async () => {
    if (noticePeriod < 1 || noticePeriod > 365) {
      setError('Notice period must be between 1 and 365 days');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const settingsData = {
        hostelId,
        noticePeriod,
        updatedAt: new Date().toISOString()
      };

      if (settingsId) {
        await update('hostelSettings', settingsId, settingsData);
      } else {
        const newSettings = await create('hostelSettings', settingsData);
        setSettingsId(newSettings.id);
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Settings sx={{ mr: 1 }} />
        Hostel Settings
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Checkout Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure the notice period for tenant checkouts. Tenants who checkout before completing 
            the notice period will not receive their deposit refund.
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="Notice Period (Days)"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 365 }}
            helperText="Minimum stay period required for deposit refund (1-365 days)"
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Policy Preview:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Tenants must stay for at least <strong>{noticePeriod} days</strong> to be eligible for deposit refund
              • Early checkout (before {noticePeriod} days) = No refund
              • Checkout after {noticePeriod} days = Full deposit refund
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HostelSettingsDialog;
