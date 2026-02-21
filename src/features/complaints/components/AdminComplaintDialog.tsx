import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  Collapse,
  IconButton,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ComplaintComments from '../../tenants/components/ComplaintComments';

interface AdminComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
  openToComments?: boolean;
}

const AdminComplaintDialog: React.FC<AdminComplaintDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem,
  openToComments = false
}) => {
  const [formData, setFormData] = useState({
    status: 'open',
    assignedTo: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);

  useEffect(() => {
    const loadComplaintData = async () => {
      if (editingItem) {
        // Fetch latest complaint data
        try {
          const { getAll } = await import('../../../shared/services/storage/fileDataService');
          const complaints = await getAll('complaints');
          const latestComplaint = complaints.find((c: any) => c.id === editingItem.id);
          
          if (latestComplaint) {
            setFormData({
              status: latestComplaint.status || 'open',
              assignedTo: latestComplaint.assignedTo || ''
            });
            setComments(latestComplaint.comments || []);
          } else {
            setFormData({
              status: editingItem.status || 'open',
              assignedTo: editingItem.assignedTo || ''
            });
            setComments(editingItem.comments || []);
          }
        } catch (error) {
          console.error('Error loading latest complaint data:', error);
          setFormData({
            status: editingItem.status || 'open',
            assignedTo: editingItem.assignedTo || ''
          });
          setComments(editingItem.comments || []);
        }
      } else {
        setFormData({
          status: 'open',
          assignedTo: ''
        });
        setComments([]);
      }
      
      // Set tab based on openToComments prop
      setTabValue(openToComments ? 1 : 0);
    };
    
    if (open) {
      loadComplaintData();
    }
  }, [editingItem, open, openToComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      

    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };
  
  const handleAddComment = async (comment: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://hostelmanagementbackend-production.up.railway.app/api'}/complaints/${editingItem.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment,
          author: user.name,
          role: user.role
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const result = await response.json();
      setComments(result.complaint.comments || []);
      
      // Send notification for new comment
      try {
        const { CompleteNotificationService } = await import('../../../services/completeNotificationService');
        const { FCMTokenService } = await import('../../../services/fcmTokenService');
        
        // Send both local and push notifications
        await CompleteNotificationService.newComment(
          editingItem.id,
          user.name || 'Admin'
        );
        
        await FCMTokenService.sendCommentNotification(
          editingItem.id,
          user.name || 'Admin',
          user.hostelId
        );
      } catch (notificationError) {
        console.warn('Failed to send comment notification:', notificationError);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
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

  const getAvailableStatuses = () => {
    // Admin statuses - exclude 'reopen' as only tenants can reopen complaints
    const adminStatuses = [
      { value: 'open', label: 'Open' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' },
      { value: 'duplicate', label: 'Duplicate' }
    ];
    
    // If complaint is resolved, admin cannot change status (only tenant can reopen)
    if (editingItem && editingItem.status === 'resolved') {
      return [{ value: 'resolved', label: 'Resolved (Only tenant can reopen)' }];
    }
    
    // If current status is 'reopen', include it in the list but filter other options
    if (editingItem && editingItem.status === 'reopen') {
      return [
        { value: 'reopen', label: 'Reopened' },
        ...adminStatuses.filter(status => status.value !== 'open')
      ];
    }
    
    // Prevent reverting from in-progress to open
    if (editingItem && editingItem.status === 'in-progress') {
      return adminStatuses.filter(status => status.value !== 'open');
    }
    
    // If current status is not 'open', exclude 'open' from options
    if (editingItem && editingItem.status !== 'open') {
      return adminStatuses.filter(status => status.value !== 'open');
    }
    
    return adminStatuses;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={window.innerWidth < 600}
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: '100%' },
          height: { xs: '100%', sm: 'auto' },
          maxHeight: { xs: '100%', sm: '90vh' },
          borderRadius: { xs: 0, sm: 2 },
          display: 'flex',
          flexDirection: 'column'
        },
        '& .MuiDialogContent-root': {
          flex: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        fontSize: { xs: '1.1rem', sm: '1.25rem' },
        fontWeight: 600,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        🎯 Complaint Management
      </DialogTitle>
      <DialogContent>
        {editingItem && (
          <Box sx={{ mb: 3 }}>
            {/* Complaint Details Section */}
            <Box sx={{ 
              mb: 3, 
              p: { xs: 1.5, sm: 2 }, 
              bgcolor: 'primary.50', 
              borderRadius: { xs: 1, sm: 2 }, 
              border: '1px solid', 
              borderColor: 'primary.200' 
            }}>
              <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                📋 Complaint Details
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                {editingItem.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {editingItem.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={editingItem.category} size="small" color="primary" variant="outlined" />
                <Chip label={editingItem.priority} size="small" color="warning" variant="outlined" />
                <Chip label={`Room ${editingItem.room}`} size="small" color="info" variant="outlined" />
                <Chip label={editingItem.tenantName} size="small" color="secondary" variant="outlined" />
                <Chip 
                  label={editingItem.status} 
                  size="small" 
                  color={getStatusColor(editingItem.status) as any}
                  variant="filled"
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  📅 Submitted: {new Date(editingItem.createdAt).toLocaleString()}
                </Typography>
                {editingItem.updatedAt && editingItem.updatedAt !== editingItem.createdAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    🔄 Last Updated: {new Date(editingItem.updatedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>


            

          </Box>
        )}
        
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: { xs: 'auto', sm: 160 },
              px: { xs: 1, sm: 2 }
            },
            '& .MuiTabs-scrollButtons': {
              display: { xs: 'flex', sm: 'none' }
            }
          }}
        >
          <Tab label="⚙️ Update Status" />
          <Tab label={`💬 Comments (${comments.length})`} />
          <Tab label={`📎 Attachments (${editingItem?.attachments?.length || 0})`} />
        </Tabs>
        
        {tabValue === 0 && (
          <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'grey.50', borderRadius: 1 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                <FormControl fullWidth size={window.innerWidth < 600 ? 'small' : 'medium'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={editingItem && editingItem.status === 'resolved'}
                  >
                    {getAvailableStatuses().map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Assigned To"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g., Maintenance Team, John Doe"
                  fullWidth
                  size={window.innerWidth < 600 ? 'small' : 'medium'}
                  disabled={editingItem && editingItem.status === 'resolved'}
                />
              </Box>
            </form>
          </Box>
        )}
        
        {tabValue === 1 && editingItem && (
          <ComplaintComments
            complaintId={editingItem.id}
            comments={comments}
            onAddComment={handleAddComment}
            currentUser={{
              name: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin',
              role: 'admin'
            }}
          />
        )}
        
        {tabValue === 2 && editingItem && (
          <Box sx={{ 
            p: { xs: 1, sm: 2 }, 
            bgcolor: 'success.50', 
            borderRadius: { xs: 1, sm: 2 }, 
            border: '1px solid', 
            borderColor: 'success.200' 
          }}>
            <Typography variant="h6" color="success.main" sx={{ 
              fontWeight: 600, 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              📎 Attachments ({editingItem.attachments ? editingItem.attachments.length : 0})
            </Typography>
            {editingItem.attachments && editingItem.attachments.length > 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(auto-fill, minmax(100px, 1fr))', sm: 'repeat(auto-fill, minmax(120px, 1fr))' }, 
                gap: { xs: 1, sm: 2 } 
              }}>
                {editingItem.attachments.map((attachment: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      borderRadius: { xs: 1, sm: 2 },
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'success.300',
                      '&:hover': { borderColor: 'success.500' }
                    }}
                    onClick={() => window.open(`http://192.168.0.138:5000${attachment.path}`, '_blank')}
                  >
                    <Box
                      component="img"
                      src={`http://192.168.0.138:5000${attachment.path}`}
                      alt={attachment.originalName || `Attachment ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: { xs: 100, sm: 120 },
                        objectFit: 'cover'
                      }}
                    />
                    <Box sx={{ p: { xs: 0.5, sm: 1 }, bgcolor: 'white', borderTop: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="caption" sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                        fontWeight: 500 
                      }}>
                        🖼️ Image {index + 1}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontStyle: 'italic',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                No attachments provided with this complaint
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {tabValue === 0 && (
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={editingItem && editingItem.status === 'resolved'}
          >
            {editingItem && editingItem.status === 'resolved' ? 'Complaint Resolved' : 'Update Complaint'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminComplaintDialog;
