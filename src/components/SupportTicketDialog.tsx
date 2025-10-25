import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  MenuItem
} from '@mui/material';
import { create } from '../services/fileDataService';
import { useAuth } from '../context/AuthContext';
import { SupportTicketService } from '../services/supportTicketService';

interface SupportTicketDialogProps {
  open: boolean;
  onClose: () => void;
}

const SupportTicketDialog: React.FC<SupportTicketDialogProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'technical'
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.message.trim()) return 'Message is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ticket = {
        id: ticketId,
        ...formData,
        submittedBy: user?.name || 'Unknown',
        submittedById: user?.id,
        hostelName: user?.hostelName || 'Unknown',
        hostelId: user?.hostelId,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await create('supportTickets', ticket);
      
      // Send notification to master admin
      await SupportTicketService.notifyTicketCreated(ticket);
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          subject: '',
          message: '',
          priority: 'medium',
          category: 'technical'
        });
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit support ticket');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleClose = () => {
    if (!isSubmitting && !success) {
      setFormData({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'technical'
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Contact Support</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {success ? (
            <Alert severity="success" sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                🎫 Support Ticket Submitted!
              </Typography>
              <Typography variant="body2">
                Your ticket has been submitted successfully. Our team will respond soon.
              </Typography>
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Describe your issue and our support team will help you.
                </Typography>
                
                <TextField
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  fullWidth
                  required
                  placeholder="Brief description of your issue"
                />
                
                <TextField
                  label="Category"
                  value={formData.category}
                  onChange={handleChange('category')}
                  select
                  fullWidth
                >
                  <MenuItem value="technical">Technical Issue</MenuItem>
                  <MenuItem value="account">Account Issue</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="feature">Feature Request</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                
                <TextField
                  label="Priority"
                  value={formData.priority}
                  onChange={handleChange('priority')}
                  select
                  fullWidth
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>
                
                <TextField
                  label="Message"
                  value={formData.message}
                  onChange={handleChange('message')}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  placeholder="Please describe your issue in detail..."
                />
              </Box>
            </>
          )}
        </DialogContent>
        {!success && (
          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
};

export default SupportTicketDialog;