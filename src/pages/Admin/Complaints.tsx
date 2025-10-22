import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,

} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Search, Download, Refresh, NotificationsActive, Warning, ReportProblem, Schedule, CheckCircle, PriorityHigh } from '@mui/icons-material';
import toast from 'react-hot-toast';
import ListPage from '../../components/common/ListPage';
import { complaintFields } from '../../components/common/FormConfigs';
import { complaintCardFields } from '../../components/common/MobileCardConfigs';
import AdminComplaintDialog from '../../components/AdminComplaintDialog';



const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openToComments, setOpenToComments] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    dateRange: 'all'
  });

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { getAll } = await import('../../services/fileDataService');
        const allComplaints = await getAll('complaints');
        const hostelComplaints = allComplaints.filter((c: any) => c.hostelId === user.hostelId);
        setComplaints(hostelComplaints);
        setLoading(false);
      } catch (error) {
        console.error('Error loading complaints:', error);
        setLoading(false);
      }
    };
    loadComplaints();
  }, []);
  
  // Handle notification clicks
  useEffect(() => {
    const handleNotificationClick = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const complaintId = urlParams.get('complaintId');
      const openComments = urlParams.get('openComments') === 'true';
      
      if (complaintId && complaints.length > 0) {
        const complaint = complaints.find(c => c.id === complaintId);
        if (complaint) {
          setSelectedComplaint(complaint);
          setOpenToComments(openComments);
          setDialogOpen(true);
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    handleNotificationClick();
  }, [complaints]);

  const customSubmitLogic = async (formData: any, editingItem: any) => {
    // If this is called from ListPage edit action, open our custom dialog
    if (editingItem && !formData) {
      handleComplaintEdit(editingItem);
      return editingItem;
    }
    
    if (editingItem && formData) {
      try {
        // Actually update the complaint via API
        const { update } = await import('../../services/fileDataService');
        await update('complaints', editingItem.id, formData);
        
        // Show success toast
        toast.success('Complaint updated successfully!');
        
        // Close dialog and refresh complaints data after update
        setDialogOpen(false);
        setSelectedComplaint(null);
        setOpenToComments(false);
        
        // Refresh complaints data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { getAll } = await import('../../services/fileDataService');
        const allComplaints = await getAll('complaints');
        const hostelComplaints = allComplaints.filter((c: any) => c.hostelId === user.hostelId);
        setComplaints(hostelComplaints);
        setRefreshKey(prev => prev + 1);
        
        return { ...editingItem, ...formData, updatedAt: new Date().toISOString() };
      } catch (error) {
        console.error('Error updating complaint:', error);
        toast.error('Failed to update complaint');
        throw error;
      }
    }
    return editingItem;
  };
  
  const handleComplaintEdit = (complaint: any) => {
    setSelectedComplaint(complaint);
    setOpenToComments(false);
    setDialogOpen(true);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'duplicate': return 'info';
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
      case 'technical': return 'info';
      default: return 'default';
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch = !filters.search || 
        complaint.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.tenantName.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.room.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || complaint.status === filters.status;
      const matchesCategory = !filters.category || complaint.category === filters.category;
      const matchesPriority = !filters.priority || complaint.priority === filters.priority;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [complaints, filters]);

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Complaint',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip
              label={params.row.category}
              color={getCategoryColor(params.row.category) as any}
              size="small"
              sx={{ fontSize: '0.7rem', height: 18 }}
            />
            <Typography variant="caption" color="text.secondary">
              #{params.row.id}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'tenantName',
      headerName: 'Tenant',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ py: 0.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {params.value || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            Room {params.row.room || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value) as any}
          size="small"
          variant="filled"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={params.value.replace('-', ' ')}
            color={getStatusColor(params.value) as any}
            size="small"
            variant="filled"
          />
          {params.row.isOverdue && (
            <Warning color="error" fontSize="small" />
          )}
        </Box>
      )
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {params.value ? new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <Button
          key="manage"
          size="small"
          variant="contained"
          onClick={() => handleComplaintEdit(params.row)}
        >
          Manage
        </Button>
      ]
    }
  ];

  const additionalActions = (
    <>
      <Button variant="outlined" startIcon={<Download />} size="small">
        Export
      </Button>
      <Button variant="outlined" startIcon={<Refresh />} size="small">
        Refresh
      </Button>
      <Button variant="outlined" startIcon={<NotificationsActive />} size="small">
        Notify
      </Button>
    </>
  );

  const statsCards = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }} key={`admin-stats-${refreshKey}`}>
      <Card sx={{ background: 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {complaints.filter(c => c.status === 'open' || c.status === 'reopen').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Open Complaints</Typography>
            </Box>
            <ReportProblem sx={{ fontSize: 48, opacity: 0.8 }} />
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {complaints.filter(c => c.status === 'in-progress').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>In Progress</Typography>
            </Box>
            <Schedule sx={{ fontSize: 48, opacity: 0.8 }} />
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {complaints.filter(c => c.status === 'resolved').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Resolved</Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {complaints.filter(c => c.priority === 'high').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>High Priority</Typography>
            </Box>
            <PriorityHigh sx={{ fontSize: 48, opacity: 0.8 }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const filtersCard = (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr', md: '2fr 1fr 1fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search complaints..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="noise">Noise</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="security">Security</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              label="Priority"
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setFilters({ search: '', status: '', category: '', priority: '', dateRange: 'all' })}
          >
            Clear
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {statsCards}
      {filtersCard}
      <ListPage
        title="Complaints"
        data={filteredComplaints}
        columns={columns}
        fields={complaintFields}
        entityName="Complaint"
        entityKey="complaints"
        rowHeight={70}
        mobileCardConfig={{
          titleField: 'title',
          fields: [
            { key: 'category', label: 'Category', value: 'category' },
            { key: 'priority', label: 'Priority', value: 'priority' },
            { key: 'status', label: 'Status', value: 'status' },
            { key: 'tenantId', label: 'Tenant', value: 'tenantId' },
            { key: 'createdAt', label: 'Created', value: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString() }
          ]
        }}
        customSubmitLogic={customSubmitLogic}
        hideAdd={true}
        hideDelete={true}
        hideEdit={true}
        hideActions={true}
        additionalActions={additionalActions}
      />
      
      {/* Custom Complaint Dialog */}
      {selectedComplaint && (
        <AdminComplaintDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedComplaint(null);
            setOpenToComments(false);
          }}
          onSubmit={(data) => customSubmitLogic(data, selectedComplaint)}
          editingItem={selectedComplaint}
          openToComments={openToComments}
        />
      )}

    </Box>
  );
};

export default Complaints;