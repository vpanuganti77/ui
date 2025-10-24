import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  TextField,
} from '@mui/material';
import toast from 'react-hot-toast';
import ComplaintComments from './ComplaintComments';

interface TenantComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  complaint: any;
  openToComments?: boolean;
}

const TenantComplaintDialog: React.FC<TenantComplaintDialogProps> = ({
  open,
  onClose,
  complaint,
  openToComments = false
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [isReopening, setIsReopening] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  useEffect(() => {
    const loadComplaintData = async () => {
      if (complaint) {
        // Fetch latest complaint data
        try {
          const { getAll } = await import('../services/fileDataService');
          const complaints = await getAll('complaints');
          const latestComplaint = complaints.find((c: any) => c.id === complaint.id);
          
          if (latestComplaint) {
            setComments(latestComplaint.comments || []);
          } else {
            setComments(complaint.comments || []);
          }
        } catch (error) {
          console.error('Error loading latest complaint data:', error);
          setComments(complaint.comments || []);
        }
      }
    };
    
    if (open) {
      loadComplaintData();
    }
  }, [complaint, open, openToComments]);

  const handleAddComment = async (comment: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api'}/complaints/${complaint.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment,
          author: user.name,
          role: 'tenant'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const result = await response.json();
      setComments(result.complaint.comments || []);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };
  
  const handleReopenComplaint = async () => {
    if (!reopenReason.trim()) {
      return;
    }
    
    try {
      setIsReopening(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // First add the reopen reason as a system comment
      await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api'}/complaints/${complaint.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: `Complaint reopened. Reason: ${reopenReason.trim()}`,
          author: 'System',
          role: 'system'
        })
      });
      
      // Then update the complaint status
      const { update } = await import('../services/fileDataService');
      await update('complaints', complaint.id, {
        status: 'reopen',
        reopenedBy: user.name,
        reopenedAt: new Date().toISOString(),
        reopenReason: reopenReason.trim(),
        updatedAt: new Date().toISOString()
      });
      
      setReopenDialogOpen(false);
      setReopenReason('');
      
      // Show success toast
      toast.success('Complaint reopened successfully!');
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error reopening complaint:', error);
      toast.error('Failed to reopen complaint');
      setIsReopening(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'reopen': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'primary';
      case 'cleanliness': return 'secondary';
      case 'food': return 'success';
      case 'noise': return 'warning';
      case 'security': return 'error';
      default: return 'default';
    }
  };

  if (!complaint) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Complaint Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>{complaint.title}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {complaint.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={complaint.category} 
                size="small" 
                color={getCategoryColor(complaint.category) as any}
              />
              <Chip 
                label={complaint.priority} 
                size="small" 
                color={getPriorityColor(complaint.priority) as any}
              />
              <Chip 
                label={complaint.status} 
                size="small" 
                color={getStatusColor(complaint.status) as any}
              />
              <Chip label={`Room ${complaint.room}`} size="small" />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Submitted: {new Date(complaint.createdAt).toLocaleString()}
              </Typography>
              {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  Last Updated: {new Date(complaint.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
          
          <ComplaintComments
            complaintId={complaint.id}
            comments={comments}
            onAddComment={handleAddComment}
            currentUser={{
              name: JSON.parse(localStorage.getItem('user') || '{}').name || 'Tenant',
              role: 'tenant'
            }}
          />
        </DialogContent>
        <DialogActions>
          {complaint.status === 'resolved' && (
            <Button 
              onClick={() => setReopenDialogOpen(true)}
              variant="outlined"
              color="warning"
              disabled={isReopening}
            >
              Reopen Complaint
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Reopen Reason Dialog */}
      <Dialog open={reopenDialogOpen} onClose={() => setReopenDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reopen Complaint</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for reopening this complaint:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Explain why you're reopening this complaint..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReopenDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReopenComplaint}
            variant="contained"
            color="warning"
            disabled={!reopenReason.trim() || isReopening}
          >
            {isReopening ? 'Reopening...' : 'Reopen Complaint'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TenantComplaintDialog;