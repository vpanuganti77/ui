import React, { useState, useMemo } from 'react';
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
import ListPage from '../../components/common/ListPage';
import { complaintFields } from '../../components/common/FormConfigs';
import { complaintCardFields } from '../../components/common/MobileCardConfigs';

const initialComplaints = [
  {
    id: '1',
    title: 'AC not working',
    description: 'The air conditioner in room R001 is not cooling properly.',
    category: 'maintenance',
    priority: 'high',
    status: 'open',
    tenantName: 'John Doe',
    tenantPhone: '9876543210',
    room: 'R001',
    hostel: 'Main Block',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
    assignedTo: '',
    adminNotes: '',
    resolutionNotes: '',
    photos: ['ac-issue-1.jpg'],
    isOverdue: true
  },
  {
    id: '2',
    title: 'Water leakage',
    description: 'There is water leakage in the bathroom ceiling.',
    category: 'maintenance',
    priority: 'medium',
    status: 'in-progress',
    tenantName: 'Jane Smith',
    tenantPhone: '9876543211',
    room: 'R205',
    hostel: 'Block A',
    createdAt: '2024-03-14T14:20:00Z',
    updatedAt: '2024-03-16T09:15:00Z',
    assignedTo: 'Maintenance Team',
    adminNotes: 'Plumber contacted, will fix tomorrow',
    resolutionNotes: '',
    photos: ['leak-1.jpg', 'leak-2.jpg'],
    isOverdue: false
  }
];

const Complaints: React.FC = () => {
  const [complaints] = useState(initialComplaints);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    dateRange: 'all'
  });

  const customSubmitLogic = (formData: any, editingItem: any) => {
    if (editingItem) {
      return { ...editingItem, ...formData };
    } else {
      return {
        id: (Math.random() * 1000).toString(),
        ...formData,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: '',
        adminNotes: '',
        resolutionNotes: '',
        photos: [],
        isOverdue: false
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
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
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.room} • {params.row.hostel}
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
          {new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Typography>
      )
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
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
      <Card sx={{ background: 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {complaints.filter(c => c.status === 'open').length}
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
        data={[]}
        columns={columns}
        fields={complaintFields}
        entityName="Complaint"
        entityKey="complaints"
        mobileCardConfig={{
          titleField: 'title',
          fields: complaintCardFields
        }}
        customSubmitLogic={customSubmitLogic}
        additionalActions={additionalActions}
      />
    </Box>
  );
};

export default Complaints;