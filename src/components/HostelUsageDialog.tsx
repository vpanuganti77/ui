import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { getAll } from '../shared/services/storage/fileDataService';

interface HostelUsageDialogProps {
  open: boolean;
  onClose: () => void;
  hostel: any;
}

const HostelUsageDialog: React.FC<HostelUsageDialogProps> = ({ open, onClose, hostel }) => {
  const [usage, setUsage] = useState({
    tenants: 0,
    rooms: 0,
    payments: 0,
    complaints: 0
  });

  useEffect(() => {
    if (open && hostel) {
      loadUsageData();
    }
  }, [open, hostel]);

  const loadUsageData = async () => {
    try {
      const [tenants, rooms, payments, complaints] = await Promise.all([
        getAll('tenants'),
        getAll('rooms'),
        getAll('payments'),
        getAll('complaints')
      ]);

      setUsage({
        tenants: tenants.filter((t: any) => t.hostelId === hostel.id).length,
        rooms: rooms.filter((r: any) => r.hostelId === hostel.id).length,
        payments: payments.filter((p: any) => p.hostelId === hostel.id).length,
        complaints: complaints.filter((c: any) => c.hostelId === hostel.id).length
      });
    } catch (error) {
      console.error('Failed to load usage data:', error);
    }
  };

  const hasUsage = usage.tenants > 0 || usage.rooms > 0 || usage.payments > 0 || usage.complaints > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Hostel Usage Details</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          {hostel?.name}
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip label={`${usage.tenants} Tenants`} color={usage.tenants > 0 ? 'primary' : 'default'} />
          <Chip label={`${usage.rooms} Rooms`} color={usage.rooms > 0 ? 'primary' : 'default'} />
          <Chip label={`${usage.payments} Payments`} color={usage.payments > 0 ? 'primary' : 'default'} />
          <Chip label={`${usage.complaints} Complaints`} color={usage.complaints > 0 ? 'primary' : 'default'} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {hasUsage ? (
          <Typography color="warning.main">
            ⚠️ This hostel has associated data. Deleting it will also remove all related tenants, rooms, payments, and complaints.
          </Typography>
        ) : (
          <Typography color="success.main">
            ✅ This hostel has no associated data and can be safely deleted.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HostelUsageDialog;
