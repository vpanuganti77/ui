import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add, Send, Announcement } from '@mui/icons-material';
import { useListManager } from '../../hooks/useListManager';
import { create, getAll } from '../../services/fileDataService';
import StyledDataGrid from '../../components/common/StyledDataGrid';
import { statusRenderer } from '../../components/common/MobileCardConfigs';

const Notices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: notices, setData } = useListManager({
    entityName: 'Notice',
    entityKey: 'notices'
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await create('notices', {
        ...formData,
        hostelId: user.hostelId,
        createdBy: user.name,
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      setOpen(false);
      setFormData({ title: '', message: '', priority: 'normal' });
      // Reload data by updating state
      const updatedNotices = await getAll('notices');
      setData(updatedNotices);
      setSnackbar({ open: true, message: 'Notice sent successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send notice', severity: 'error' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'message', headerName: 'Message', flex: 2, minWidth: 300 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
        />
      )
    },
    { field: 'createdBy', headerName: 'Created By', width: 150 },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 120,
      renderCell: (params: any) => new Date(params.value).toLocaleDateString()
    }
  ];

  const mobileCardConfig = {
    titleField: 'title',
    fields: [
      { key: 'message', label: 'Message', value: 'message' },
      { key: 'priority', label: 'Priority', value: 'priority', render: (value: string) => statusRenderer(value, getPriorityColor) },
      { key: 'createdBy', label: 'Created By', value: 'createdBy' },
      { key: 'createdAt', label: 'Date', value: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString() }
    ]
  };



  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: 2
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 600 }}>
          Send Notices
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          size={isMobile ? 'medium' : 'large'}
          fullWidth={isMobile}
        >
          New Notice
        </Button>
      </Box>

      <Card sx={{ 
        boxShadow: { xs: 1, sm: 3 },
        borderRadius: { xs: 2, sm: 3 }
      }}>
        <CardContent sx={{ p: { xs: 1, sm: 0 } }}>
          <StyledDataGrid
            rows={notices || []}
            columns={columns}
            mobileCardConfig={mobileCardConfig}
            height={isMobile ? 400 : 450}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Announcement color="primary" />
          Send New Notice
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Notice Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />} onClick={handleSubmit}>
            Send Notice
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notices;