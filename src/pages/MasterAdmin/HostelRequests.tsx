import React, { useState } from 'react';
import { Chip, Typography, Box, Button, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Business, Phone, Email, CheckCircle, Schedule, ThumbUp } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';
import UserCredentialsDialog from '../../components/UserCredentialsDialog';
import { create, update } from '../../services/fileDataService';

const HostelRequests: React.FC = () => {
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    userDetails: any;
  }>({ open: false, userDetails: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuickApprove = async (request: any) => {
    try {
      console.log('Starting quick approve for:', request);
      
      // Use new backend approval endpoint
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/hostelRequests/${request.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve hostel');
      }
      
      const result = await response.json();
      console.log('Approval result:', result);
      
      setTimeout(() => {
        setCredentialsDialog({
          open: true,
          userDetails: {
            name: result.name,
            email: result.userCredentials.email,
            password: result.userCredentials.password,
            hostelName: result.hostelName,
            role: 'admin',
            loginUrl: result.userCredentials.loginUrl
          }
        });
      }, 500);
      
      setSnackbar({ 
        open: true, 
        message: 'Hostel and admin account created successfully!', 
        severity: 'success' 
      });
      
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Quick approve error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 
        severity: 'error' 
      });
    }
  };

  const customSubmitLogic = async (formData: any, editingItem: any) => {
    if (editingItem) {
      const updatedRequest = {
        ...editingItem,
        status: formData.status,
        notes: formData.notes,
        isRead: true,
        processedAt: new Date().toISOString()
      };

      // If approved, use backend approval endpoint
      if (formData.status === 'approved' && editingItem.status !== 'approved') {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/hostelRequests/${editingItem.id}/approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to approve hostel');
          }
          
          const result = await response.json();
          
          setTimeout(() => {
            setCredentialsDialog({
              open: true,
              userDetails: {
                name: result.name,
                email: result.userCredentials.email,
                password: result.userCredentials.password,
                hostelName: result.hostelName,
                role: 'admin',
                loginUrl: result.userCredentials.loginUrl
              }
            });
          }, 500);
          
          setSnackbar({ 
            open: true, 
            message: 'Hostel approved and admin account created!', 
            severity: 'success' 
          });
          
        } catch (error) {
          setSnackbar({ 
            open: true, 
            message: 'Error creating hostel: ' + (error instanceof Error ? error.message : 'Unknown error'), 
            severity: 'error' 
          });
        }
      }

      return updatedRequest;
    }
    return editingItem;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      default: return undefined;
    }
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'free_trial': return 'Free Trial';
      case 'basic': return 'Basic';
      case 'standard': return 'Standard';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      default: return planType;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'hostelName',
      headerName: 'Hostel Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Business color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'name',
      headerName: 'Contact Person',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.row.email}
          </Typography>
        </Box>
      )
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'planType',
      headerName: 'Plan',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getPlanLabel(params.value)}
          color={params.value === 'free_trial' ? 'success' : params.value === 'enterprise' ? 'error' : params.value === 'premium' ? 'primary' : params.value === 'standard' ? 'secondary' : 'default'}
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
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="filled"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'submittedAt',
      headerName: 'Submitted',
      width: 120,
      valueFormatter: (params: any) => new Date(params).toLocaleDateString()
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params: any) => {
        const actions = [];
        if (params.row.status === 'pending') {
          actions.push(
            <GridActionsCellItem
              key="approve"
              icon={<ThumbUp color="success" />}
              label="Quick Approve"
              onClick={() => {
                console.log('Quick approve clicked for:', params.row);
                handleQuickApprove(params.row);
              }}
            />
          );
        }
        return actions;
      }
    }
  ];

  const requestFields = [
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      name: 'notes',
      label: 'Processing Notes',
      type: 'textarea' as const,
      rows: 3,
      flex: '1 1 100%'
    }
  ];

  return (
    <>
      <ListPage
        key={refreshKey}
        title="Hostel Setup Requests"
        data={[]}
        columns={columns}
        fields={requestFields}
        entityName="Request"
        entityKey="hostelRequests"
        mobileCardConfig={{
          titleField: 'hostelName',
          fields: [
            { key: 'name', label: 'Contact', value: 'name' },
            { key: 'phone', label: 'Phone', value: 'phone' },
            { key: 'planType', label: 'Plan', value: (item: any) => getPlanLabel(item.planType) },
            { key: 'status', label: 'Status', value: 'status' }
          ]
        }}
        customSubmitLogic={customSubmitLogic}
        hideDelete={true}
        hideAdd={true}
        conditionalEdit={(item: any) => item.status !== 'approved'}
        hideActions={true}
      />
      
      <UserCredentialsDialog
        open={credentialsDialog.open}
        onClose={() => setCredentialsDialog({ open: false, userDetails: null })}
        userDetails={credentialsDialog.userDetails}
      />
      
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
    </>
  );
};

export default HostelRequests;