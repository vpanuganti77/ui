import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  Divider
} from '@mui/material';
import { Warning, ExitToApp } from '@mui/icons-material';
import { create } from '../shared/services/storage/fileDataService';

interface CheckoutRequestDialogProps {
  open: boolean;
  onClose: () => void;
  tenant: any;
  noticePeriod: number; // in days
}

const CheckoutRequestDialog: React.FC<CheckoutRequestDialogProps> = ({
  open,
  onClose,
  tenant,
  noticePeriod = 30
}) => {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateRefund = () => {
    const joiningDate = new Date(tenant?.joiningDate);
    const today = new Date();
    const daysStayed = Math.floor((today.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysStayed < noticePeriod) {
      return 0; // No refund if before notice period
    }
    
    return tenant?.deposit || 0; // Full deposit refund
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for checkout');
      return;
    }

    if (!confirmed) {
      setError('Please confirm that you understand the refund policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const checkoutRequest = {
        tenantId: tenant.id,
        tenantName: tenant.name,
        roomNumber: tenant.room,
        hostelId: tenant.hostelId,
        reason,
        requestDate: new Date().toISOString(),
        status: 'pending',
        refundAmount: calculateRefund(),
        noticePeriodDays: noticePeriod
      };

      await create('checkoutRequests', checkoutRequest);
      onClose();
      setReason('');
      setConfirmed(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit checkout request');
    } finally {
      setLoading(false);
    }
  };

  const refundAmount = calculateRefund();
  const joiningDate = new Date(tenant?.joiningDate);
  const today = new Date();
  const daysStayed = Math.floor((today.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24));
  const isBeforeNoticePeriod = daysStayed < noticePeriod;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <ExitToApp sx={{ mr: 1 }} />
        Checkout Request
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Checkout Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Room: {tenant?.room} | Deposit: ₹{tenant?.deposit?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Days Stayed: {daysStayed} | Notice Period: {noticePeriod} days
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1, color: isBeforeNoticePeriod ? 'error.main' : 'success.main' }} />
            Refund Policy
          </Typography>
          
          {isBeforeNoticePeriod ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>No Refund:</strong> You have stayed for {daysStayed} days, which is less than the {noticePeriod}-day notice period. 
                No deposit refund will be provided.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Full Refund:</strong> You have completed the {noticePeriod}-day notice period. 
                Full deposit of ₹{refundAmount.toLocaleString()} will be refunded.
              </Typography>
            </Alert>
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Reason for Checkout"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for your checkout request..."
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <input
            type="checkbox"
            id="confirm-policy"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          <label htmlFor="confirm-policy">
            <Typography variant="body2">
              I understand and agree to the refund policy stated above
            </Typography>
          </label>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !reason.trim() || !confirmed}
          color={isBeforeNoticePeriod ? 'warning' : 'primary'}
        >
          {loading ? 'Submitting...' : 'Submit Checkout Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutRequestDialog;
