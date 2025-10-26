import React, { useState, useEffect } from 'react';
import { Chip, Typography, Box, Button, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Business, Phone, Email, CheckCircle, Schedule, ThumbUp } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';

import { create, update } from '../../services/fileDataService';
import { socketService } from '../../services/socketService';


const HostelRequests: React.FC = () => {

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        socketService.connect(user);
        
        // Listen for notifications that should trigger data refresh
        socketService.onNotification((notification) => {
          if (notification.type === 'hostelRequest') {
            setRefreshKey(prev => prev + 1); // Trigger ListPage refresh
          }
        });
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    }
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleQuickApprove = async (request: any) => {
    try {
      console.log('Starting quick approve for:', request);
      
      // Prevent duplicate approval
      if (request.status === 'approved') {
        setSnackbar({ 
          open: true, 
          message: 'Request is already approved!', 
          severity: 'warning' 
        });
        return;
      }
      
      // Check if hostel already exists for this request
      const { getAll } = await import('../../services/fileDataService');
      const existingHostels = await getAll('hostels');
      const existingHostel = existingHostels.find((h: any) => 
        h.contactEmail === request.email || h.name === request.hostelName
      );
      
      let hostel: any;
      let hostelId: string;
      
      if (existingHostel) {
        console.log('Using existing hostel:', existingHostel);
        hostel = existingHostel;
        hostelId = existingHostel.id;
      } else {
        // Create hostel with unique ID
        hostelId = `hostel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate hostel domain email to match user's email
        const hostelDomain = request.hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        const username = request.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const hostelContactEmail = `${username}@${hostelDomain}`;
        
        const hostelData = {
          id: hostelId,
          name: `${request.hostelName}_${Date.now()}`, // Make name unique
          displayName: request.hostelName, // Store original name for display
          address: request.address,
          contactPerson: request.name,
          contactEmail: hostelContactEmail, // Use hostel domain email
          originalContactEmail: request.email, // Store original email
          contactPhone: request.phone,
          planType: request.planType,
          status: 'active',
          trialExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          createdAt: new Date().toISOString(),
          createdBy: 'Master Admin'
        };
        
        hostel = await create('hostels', hostelData);
        console.log('Created new hostel:', hostel);
      }
      
      // Find and update existing user (don't create new one)
      const users = await getAll('users');
      
      console.log('Looking for user with request:', {
        requestId: request.id,
        requestEmail: request.email,
        requestName: request.name,
        hostelName: request.hostelName
      });
      
      console.log('Available users:', users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        originalEmail: u.originalEmail,
        requestId: u.requestId,
        hostelName: u.hostelName,
        status: u.status
      })));
      
      // Debug each search attempt
      console.log('Search 1 - by requestId:', request.id);
      console.log('Users with matching requestId:', users.filter(u => u.requestId === request.id));
      
      console.log('Search 2 - by originalEmail:', request.email);
      console.log('Users with matching originalEmail:', users.filter(u => u.originalEmail === request.email));
      
      console.log('Search 3 - by name and hostelName:', request.name, request.hostelName);
      console.log('Users with matching name and hostelName:', users.filter(u => u.name === request.name && u.hostelName === request.hostelName));
      
      // Try multiple search strategies
      let user = users.find((u: any) => u.requestId === request.id);
      
      if (!user) {
        user = users.find((u: any) => u.originalEmail === request.email);
      }
      
      if (!user) {
        user = users.find((u: any) => 
          u.name === request.name && u.hostelName === request.hostelName
        );
      }
      
      if (!user) {
        // Generate hostel domain email and search by that
        const hostelDomain = request.hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        const username = request.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const expectedEmail = `${username}@${hostelDomain}`;
        user = users.find((u: any) => u.email === expectedEmail);
      }
      
      console.log('Found user:', user);
      
      // Update user if found, but don't fail the entire process if user not found
      if (user) {
        try {
          const updatedUser = {
            ...user,
            status: 'active',
            hostelId: hostel.id || hostelId,
            hostelName: request.hostelName,
            approvedAt: new Date().toISOString()
          };
          
          await update('users', user.id, updatedUser);
          console.log('Successfully updated user:', user.name);
          
          // Update localStorage if this is the current user
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.email === user.email || currentUser.originalEmail === request.email) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (userUpdateError) {
          console.error('Failed to update user, but continuing with approval:', userUpdateError);
        }
      } else {
        console.warn('User account not found, but continuing with hostel approval');
      }
      
      // Update request status
      await update('hostelRequests', request.id, {
        ...request,
        status: 'approved',
        processedAt: new Date().toISOString(),
        hostelId: hostel.id || hostelId
      });
      
      // Create notification for the hostel admin if user was found
      if (user) {
        const notification = {
          id: `${Date.now()}_${user.id}_approval`,
          type: 'hostel_approved',
          title: 'Hostel Approved!',
          message: `Your hostel "${request.hostelName}" has been approved and is now active. You can now access all features.`,
          userId: user.id,
          hostelId: hostel.id || hostelId,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString(),
          createdBy: 'Master Admin'
        };
        
        try {
          await create('notifications', notification);
          console.log('Created approval notification for user:', user.name);
          
          // Send push notification to the specific user
          const { NotificationService } = await import('../../services/notificationService');
          await NotificationService.sendPushNotificationToUser(
            user.email,
            notification.title,
            notification.message,
            'hostel_approved'
          );
        } catch (notificationError) {
          console.error('Failed to create approval notification:', notificationError);
        }
      }
      
      // Trigger notification and dashboard refresh
      window.dispatchEvent(new CustomEvent('notificationRefresh'));
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      window.dispatchEvent(new CustomEvent('refreshData'));
      

      
      // User credentials already provided during setup - no popup needed
      
      setSnackbar({ 
        open: true, 
        message: 'Hostel request approved successfully!', 
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

      // Don't call handleQuickApprove here - it's handled by the quick approve button
      // This prevents duplicate hostel creation

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