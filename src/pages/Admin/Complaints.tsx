import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Download, Refresh, Warning, ReportProblem, Schedule, CheckCircle, PriorityHigh, Visibility } from '@mui/icons-material';
import toast from 'react-hot-toast';
import ListPage from '../../components/common/ListPage';
import { complaintFields } from '../../components/common/FormConfigs';
import { AdminComplaintDialog } from '../../features/complaints/components';
import { getComplaintFilters } from '../../utils/mobileFilterHelpers';



const Complaints: React.FC = () => {
  const theme = useTheme();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openToComments, setOpenToComments] = useState(false);



  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        const allComplaints = await getAll('complaints');
        const hostelComplaints = allComplaints.filter((c: any) => c.hostelId === user.hostelId);
        setComplaints(hostelComplaints);
      } catch (error) {
        console.error('Error loading complaints:', error);
      }
    };
    loadComplaints();
  }, [refreshKey]);
  
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

  const refreshComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { getAll } = await import('../../shared/services/storage/fileDataService');
      const allComplaints = await getAll('complaints');
      const hostelComplaints = allComplaints.filter((c: any) => c.hostelId === user.hostelId);
      setComplaints(hostelComplaints);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing complaints:', error);
    }
  };

  const customSubmitLogic = async (formData: any, editingItem: any) => {
    // If this is called from ListPage edit action, open our custom dialog
    if (editingItem && !formData) {
      handleComplaintEdit(editingItem);
      return editingItem;
    }
    
    if (editingItem && formData) {
      try {
        const { update, create } = await import('../../shared/services/storage/fileDataService');
        const { CompleteNotificationService } = await import('../../services/completeNotificationService');
        
        // Handle new complaint creation
        if (!editingItem && formData) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const { FCMTokenService } = await import('../../services/fcmTokenService');
          
          const newComplaint = {
            ...formData,
            hostelId: user.hostelId,
            createdAt: new Date().toISOString(),
            status: 'open'
          };
          const result = await create('complaints', newComplaint);
          
          // Send both local and push notifications
          await CompleteNotificationService.newComplaint(
            result.id,
            result.title,
            result.tenantName || 'Unknown'
          );
          
          await FCMTokenService.sendComplaintNotification(
            result.id,
            result.title,
            result.tenantName || 'Unknown',
            user.hostelId
          );
          
          return result;
        }
        
        // Handle complaint update
        const oldStatus = editingItem.status;
        await update('complaints', editingItem.id, formData);
        
        // Trigger notification if status changed
        if (oldStatus !== formData.status) {
          const { FCMTokenService } = await import('../../services/fcmTokenService');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          // Send both local and push notifications
          await CompleteNotificationService.statusChanged(
            editingItem.id,
            oldStatus,
            formData.status
          );
          
          await FCMTokenService.sendStatusChangeNotification(
            editingItem.id,
            oldStatus,
            formData.status,
            user.hostelId,
            editingItem.tenantId
          );
        }
        
        toast.success('Complaint updated successfully!');
        await refreshComplaints();
        window.dispatchEvent(new CustomEvent('refreshData'));
        
        setDialogOpen(false);
        setSelectedComplaint(null);
        setOpenToComments(false);
        
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
    console.log('handleComplaintEdit called with:', complaint);
    setSelectedComplaint(complaint);
    setOpenToComments(false);
    setDialogOpen(true);
    console.log('Dialog should be opening, dialogOpen set to true');
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

  const { filterOptions, sortOptions, filterFields, sortFields } = getComplaintFilters();



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
          {params.value ? new Date(params.value).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <IconButton
          key="view"
          size="small"
          onClick={() => handleComplaintEdit(params.row)}
          title="View Details"
        >
          <Visibility fontSize="small" />
        </IconButton>
      ]
    }
  ];

  const additionalActions = (
    <>
      <Button variant="outlined" startIcon={<Download />} size="small">
        Export
      </Button>
      <Button variant="outlined" startIcon={<Refresh />} size="small" onClick={refreshComplaints}>
        Refresh
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



  return (
    <Box>
      {/* Show stats only on desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {statsCards}
      </Box>
      

      

      <ListPage
        title="Complaints"
        data={[]}
        customDataLoader={async () => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const { getAll } = await import('../../shared/services/storage/fileDataService');
          const allComplaints = await getAll('complaints');
          return allComplaints.filter((c: any) => c.hostelId === user.hostelId);
        }}
        enableMobileFilters={true}
        searchFields={['title', 'tenantName', 'room']}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        filterFields={filterFields}
        sortFields={sortFields}
        entityKey="complaints"
        columns={columns}
        fields={complaintFields}
        entityName="Complaint"
        rowHeight={70}
        renderMobileCard={(item, onEdit, onDelete) => (
          <Card key={item.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleComplaintEdit(item)}
                  title="View Details"
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Box>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={item.category} 
                  size="small" 
                  color={getCategoryColor(item.category) as any}
                />
                <Chip 
                  label={item.priority} 
                  size="small" 
                  color={getPriorityColor(item.priority) as any}
                />
                <Chip 
                  label={item.status.replace('-', ' ')} 
                  size="small" 
                  color={getStatusColor(item.status) as any}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Tenant: {item.tenantName || 'N/A'} • Room: {item.room || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </CardContent>
          </Card>
        )}
        onItemClick={handleComplaintEdit}
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
