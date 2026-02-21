import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { ContactSupport } from '@mui/icons-material';
import DynamicDialog from './common/DynamicDialog';
import { supportTicketFields } from './common/FormConfigs';
import { create } from '../shared/services/storage/fileDataService';
import toast from 'react-hot-toast';

interface SupportContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const SupportContactDialog: React.FC<SupportContactDialogProps> = ({ open, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      const ticketData = {
        ...formData,
        submittedBy: user?.name || 'Unknown',
        submitterEmail: user?.email || '',
        submitterRole: user?.role || '',
        hostelId: user?.hostelId || '',
        hostelName: user?.hostelName || '',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await create('supportTickets', ticketData);
      toast.success('Support ticket submitted successfully!');
      setShowForm(false);
      onClose();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showForm) {
    return (
      <DynamicDialog
        open={open}
        onClose={() => {
          setShowForm(false);
          onClose();
        }}
        onSubmit={handleSubmit}
        title="Contact Support"
        fields={supportTicketFields}
        submitLabel="Submit Ticket"
        maxWidth="md"
      />
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ContactSupport color="primary" />
          Need Help?
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          If you have any questions about your setup or need assistance, feel free to contact our support team.
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          You can reach us through:
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Email:</strong> support@hostelpro.com
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Phone:</strong> +91-XXXX-XXXXXX
          </Typography>
          <Typography variant="body2">
            <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Or submit a support ticket below and we'll get back to you as soon as possible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          onClick={() => setShowForm(true)}
          startIcon={<ContactSupport />}
        >
          Submit Support Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupportContactDialog;
