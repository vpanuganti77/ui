import React, { useState } from 'react';
import { Chip, Typography, Box, Button, Snackbar, Alert, Tooltip } from '@mui/material';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Business, Add, Verified, Pending, Block, Visibility, PlayArrow, Stop, VpnKey } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';
import { hostelFields } from '../../components/common/FormConfigs';
import UserCredentialsDialog from '../../components/UserCredentialsDialog';
import HostelUsageDialog from '../../components/HostelUsageDialog';
import OwnerDetailsDialog from '../../components/OwnerDetailsDialog';
import { getAll, create, update } from '../../services/fileDataService';
import { getHostelsWithOwners, findAdminUserForHostel } from '../../services/hostelUserService';



const HostelManagement: React.FC = () => {
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    userDetails: any;
  }>({ open: false, userDetails: null });
  const [usageDialog, setUsageDialog] = useState<{
    open: boolean;
    hostel: any;
  }>({ open: false, hostel: null });
  const [ownerDialog, setOwnerDialog] = useState<{
    open: boolean;
    hostel: any;
  }>({ open: false, hostel: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [resetCredentials, setResetCredentials] = useState<{name: string, email: string, password: string, hostelName: string} | null>(null);
  const [hostelsWithAdmins, setHostelsWithAdmins] = useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchHostelsWithAdmins = async () => {
      try {
        const [hostels, users] = await Promise.all([
          getAll('hostels'),
          getAll('users')
        ]);
        
        const hostelsWithOwners = hostels.map((hostel: any) => {
          const admin = users.find((user: any) => 
            user.hostelId === hostel.id && user.role === 'admin'
          );
          
          console.log('Hostel:', hostel.name, 'ContactPerson:', hostel.contactPerson, 'Admin:', admin?.name);
          
          return {
            ...hostel,
            adminName: hostel.contactPerson || admin?.name || 'N/A',
            adminUserId: admin?.id || null
          };
        });
        
        console.log('Final hostels with owners:', hostelsWithOwners);
        
        setHostelsWithAdmins(hostelsWithOwners);
      } catch (error) {
        console.error('Error fetching hostels with admins:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to load hostel data', 
          severity: 'error' 
        });
      }
    };
    
    fetchHostelsWithAdmins();
  }, [refreshKey]);
  
  const handleToggleStatus = async (hostel: any) => {
    try {
      const newStatus = hostel.status === 'active' ? 'inactive' : 'active';
      const reason = hostel.status === 'active' ? 'Manually deactivated' : 'Manually activated';
      
      const updatedHostel = {
        ...hostel,
        status: newStatus,
        statusReason: reason,
        statusUpdatedAt: new Date().toISOString()
      };
      
      await update('hostels', hostel.id, updatedHostel);
      
      // Update all admin and receptionist users for this hostel
      const users = await getAll('users');
      const hostelUsers = users.filter((u: any) => 
        u.hostelId === hostel.id && (u.role === 'admin' || u.role === 'receptionist')
      );
      
      console.log(`Updating status for ${hostelUsers.length} users to ${newStatus}`);
      
      for (const user of hostelUsers) {
        try {
          await update('users', user.id, { 
            ...user, 
            status: newStatus,
            statusReason: reason,
            statusUpdatedAt: new Date().toISOString()
          });
          console.log(`Updated user ${user.name} (${user.email}) status to ${newStatus}`);
        } catch (userUpdateError) {
          console.error(`Failed to update user ${user.name}:`, userUpdateError);
        }
      }
      
      console.log(`Updated ${hostelUsers.length} users for hostel ${hostel.name}`);
      
      // Backend will automatically send WebSocket notifications when hostel status changes
      
      setSnackbar({ 
        open: true, 
        message: `Hostel ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update hostel status', 
        severity: 'error' 
      });
    }
  };

  const handleResetAdminPassword = async (hostel: any) => {
    try {
      const users = await getAll('users');
      const adminUser = findAdminUserForHostel(hostel, users);
      
      if (!adminUser) {
        setSnackbar({ 
          open: true, 
          message: `Admin user account not found for ${hostel.name}. Please create a user account first.`, 
          severity: 'error' 
        });
        return;
      }
      
      const newPassword = 'admin' + Math.random().toString(36).substring(2, 8);
      await update('users', adminUser.id, { 
        ...adminUser, 
        password: newPassword,
        firstLogin: true
      });
      
      // Show credentials dialog
      setResetCredentials({
        name: adminUser.name,
        email: adminUser.email,
        password: newPassword,
        hostelName: hostel.name
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Admin password reset successfully! User will be required to change password on next login.', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to reset admin password', 
        severity: 'error' 
      });
    }
  };
  const customSubmitLogic = async (formData: any, editingItem: any) => {
    if (editingItem) {
      return {
        ...editingItem,
        name: formData.name,
        address: formData.address,
        planType: formData.planType,
        features: formData.features,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone
      };
    } else {
      const createdAt = new Date();
      const trialExpiryDate = new Date(createdAt);
      trialExpiryDate.setDate(trialExpiryDate.getDate() + 30);
      
      // Generate admin password
      const adminPassword = 'admin' + Math.random().toString(36).substring(2, 8);
      
      const newHostel = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        planType: formData.planType || 'free_trial',
        planStatus: formData.planType === 'free_trial' ? 'trial' : 'active',
        trialExpiryDate: formData.planType === 'free_trial' ? trialExpiryDate.toISOString().split('T')[0] : null,
        features: formData.features,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: adminPassword,
        status: 'active',
        createdAt: createdAt.toISOString().split('T')[0],
        totalRooms: 0,
        occupiedRooms: 0
      };
      
      try {
        // Create admin user first
        const adminUser = {
          id: (Date.now() + 1).toString(),
          name: formData.adminName,
          email: formData.adminEmail,
          phone: formData.adminPhone,
          role: 'admin',
          password: adminPassword,
          hostelId: newHostel.id,
          hostelName: formData.name,
          status: 'active',
          createdAt: createdAt.toISOString().split('T')[0]
        };
        
        await create('users', adminUser);
        
        // Show credentials dialog
        setTimeout(() => {
          setCredentialsDialog({
            open: true,
            userDetails: {
              name: formData.adminName,
              email: formData.adminEmail,
              password: adminPassword,
              hostelName: formData.name,
              role: 'Admin'
            }
          });
        }, 500);
        
        setSnackbar({ 
          open: true, 
          message: 'Hostel and admin user created successfully', 
          severity: 'success' 
        });
        
      } catch (error) {
        console.error('Error creating admin user:', error);
        setSnackbar({ 
          open: true, 
          message: 'Hostel created but failed to create admin user', 
          severity: 'error' 
        });
      }
      
      return newHostel;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'expired': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'basic': return 'Basic';
      case 'standard': return 'Standard';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      default: return planType;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Verified fontSize="small" />;
      case 'pending': return <Pending fontSize="small" />;
      case 'inactive': return <Block fontSize="small" />;
      default: return undefined;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Hostel Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Business color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'adminName',
      headerName: 'Owner',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'planType',
      headerName: 'Plan',
      width: 120,
      renderCell: (params) => {
        const getTrialDaysLeft = () => {
          if (params.value === 'free_trial' && params.row.trialExpiryDate) {
            const today = new Date();
            const expiryDate = new Date(params.row.trialExpiryDate);
            const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysLeft;
          }
          return null;
        };
        
        const daysLeft = getTrialDaysLeft();
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={params.value === 'free_trial' ? 'Trial' : getPlanLabel(params.value)}
              color={params.value === 'free_trial' ? (daysLeft && daysLeft <= 7 ? 'warning' : 'info') : 'primary'}
              size="small"
              variant="filled"
            />
            {params.value === 'free_trial' && daysLeft !== null && (
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {daysLeft > 0 ? `${daysLeft}d` : 'Exp'}
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: 'usage',
      headerName: 'Usage',
      width: 90,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
          0/0
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            T/R
          </Typography>
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="filled"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params: any) => {
        const isActive = params.row.status === 'active';
        
        return [
          <GridActionsCellItem
            key="view"
            icon={<Visibility color="primary" />}
            label="View Details"
            onClick={() => setUsageDialog({ open: true, hostel: params.row })}
          />,
          <GridActionsCellItem
            key="reset"
            icon={<VpnKey color={params.row.adminUserId ? "warning" : "disabled"} />}
            label={params.row.adminUserId ? "Reset Admin Password" : "No Admin User Found"}
            onClick={() => handleResetAdminPassword(params.row)}
            disabled={!params.row.adminUserId}
          />,
          <GridActionsCellItem
            key="toggle"
            icon={isActive ? <Stop color="error" /> : <PlayArrow color="success" />}
            label={isActive ? 'Deactivate' : 'Activate'}
            onClick={() => handleToggleStatus(params.row)}
          />
        ];
      }
    }
  ];

  const additionalActions = (
    <Button variant="outlined" startIcon={<Add />} size="small">
      Bulk Import
    </Button>
  );

  return (
    <>
      <ListPage
        key={refreshKey}
        title="Hostel Management"
        data={hostelsWithAdmins}
        columns={columns}
        fields={hostelFields}
        entityName="Hostel"
        entityKey="hostels"
        hideActions={true}
        customDataLoader={async () => {
          const [hostels, users] = await Promise.all([
            getAll('hostels'),
            getAll('users')
          ]);
          
          return hostels.map((hostel: any) => {
            const admin = users.find((user: any) => 
              user.hostelId === hostel.id && user.role === 'admin'
            );
            
            return {
              ...hostel,
              adminName: hostel.contactPerson || admin?.name || 'N/A',
              adminUserId: admin?.id || null
            };
          });
        }}
        mobileCardConfig={{
          titleField: 'name',
          fields: [
            { key: 'adminName', label: 'Owner', value: 'adminName' },
            { key: 'planType', label: 'Plan', value: (item: any) => getPlanLabel(item.planType) },
            { key: 'usage', label: 'Usage', value: '0/0 (T/R)' },
            { key: 'status', label: 'Status', value: 'status' }
          ]
        }}
        customSubmitLogic={customSubmitLogic}
        additionalActions={additionalActions}
      />
      
      <UserCredentialsDialog
        open={credentialsDialog.open}
        onClose={() => setCredentialsDialog({ open: false, userDetails: null })}
        userDetails={credentialsDialog.userDetails}
      />
      
      <HostelUsageDialog
        open={usageDialog.open}
        onClose={() => setUsageDialog({ open: false, hostel: null })}
        hostel={usageDialog.hostel}
      />
      
      <OwnerDetailsDialog
        open={ownerDialog.open}
        onClose={() => setOwnerDialog({ open: false, hostel: null })}
        hostel={ownerDialog.hostel}
      />
      
      {/* Reset Admin Password Dialog */}
      {resetCredentials && (
        <UserCredentialsDialog
          open={!!resetCredentials}
          onClose={() => setResetCredentials(null)}
          userDetails={{
            name: resetCredentials.name,
            email: resetCredentials.email,
            password: resetCredentials.password,
            hostelName: resetCredentials.hostelName,
            role: 'admin',
            loginUrl: `${window.location.origin}/login?email=${encodeURIComponent(resetCredentials.email)}&password=${encodeURIComponent(resetCredentials.password)}`
          }}
        />
      )}
      
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

export default HostelManagement;