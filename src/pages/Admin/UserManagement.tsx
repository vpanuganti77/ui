import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Lock, LockOpen, VpnKey, Edit, Delete, MoreVert } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';
import { userFields } from '../../components/common/FormConfigs';
import { userCardFields } from '../../components/common/MobileCardConfigs';
import { update, getById } from '../../services/fileDataService';
import UserCredentialsDialog from '../../components/UserCredentialsDialog';
import UserFormDialog from '../../components/UserFormDialog';

const UserManagement: React.FC = () => {
  const [resetDialog, setResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newUserCredentials, setNewUserCredentials] = useState<{email: string, password: string} | null>(null);
  const [resetCredentials, setResetCredentials] = useState<{name: string, email: string, password: string} | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }
  }, []);

  const customSubmitLogic = async (formData: any, editingItem: any) => {
    if (editingItem) {
      const updatedUser = { ...editingItem, ...formData };
      await update('users', editingItem.id, updatedUser);
      return updatedUser;
    } else {
      const password = formData.password || 'user123';
      const userData = localStorage.getItem('user');
      let hostelId = null;
      let hostelName = '';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          hostelId = user.hostelId;
          hostelName = user.hostelName || '';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // Generate email based on hostel domain
      const hostelDomain = hostelName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const username = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${username}@${hostelDomain}`;
      
      const newUser = {
        ...formData,
        email,
        hostelId,
        id: Date.now().toString(),
        password,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      // Set credentials for login link
      setNewUserCredentials({ email, password });
      setSelectedUser({ name: formData.name });
      
      return newUser;
    }
  };

  const handleResetPassword = async () => {
    try {
      const newPassword = 'user' + Math.random().toString(36).substring(2, 8);
      await update('users', selectedUser.id, { 
        ...selectedUser, 
        password: newPassword,
        firstLogin: true
      });
      
      // Show credentials dialog
      setResetCredentials({
        name: selectedUser.name,
        email: selectedUser.email,
        password: newPassword
      });
      
      setResetDialog(false);
      setRefreshKey(prev => prev + 1);
      setSnackbar({ 
        open: true, 
        message: 'Password reset successfully! User will be required to change password on next login.', 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to reset password', 
        severity: 'error' 
      });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (userId === currentUserId) {
      setSnackbar({ open: true, message: 'You cannot change your own account status', severity: 'error' });
      return;
    }
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const user = await getById('users', userId);
      await update('users', userId, { ...user, status: newStatus });
      
      // Trigger refresh
      setRefreshKey(prev => prev + 1);
      
      setSnackbar({ 
        open: true, 
        message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Failed to update user status', severity: 'error' });
    }
  };

  const handleUnlockAccount = async (userId: string) => {
    if (userId === currentUserId) {
      setSnackbar({ open: true, message: 'You cannot unlock your own account', severity: 'error' });
      return;
    }
    try {
      const user = await getById('users', userId);
      await update('users', userId, { 
        ...user, 
        isLocked: false, 
        failedLoginAttempts: 0,
        lockedAt: null,
        lockedBy: null
      });
      
      // Trigger refresh
      setRefreshKey(prev => prev + 1);
      
      setSnackbar({ 
        open: true, 
        message: 'Account unlocked successfully', 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Failed to unlock account', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'primary' : 'default';
  };

  const isCurrentUser = (user: any) => {
    if (!user || !currentUserId) return false;
    return user.id === currentUserId;
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1, 
      minWidth: 200
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 120
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getRoleColor(params.value) as any}
          size="small"
          variant="filled"
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => {
        if (params.row.isLocked) {
          return (
            <Chip 
              label="Locked" 
              color="error"
              size="small"
              variant="filled"
            />
          );
        }
        return (
          <Chip 
            label={params.value || 'active'} 
            color={getStatusColor(params.value || 'active') as any}
            size="small"
            variant="filled"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: (params) => (
        <Button
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedUser(params.row);
          }}
          disabled={isCurrentUser(params.row)}
        >
          <MoreVert />
        </Button>
      )
    }
  ];

  return (
    <>
      <ListPage
        key={refreshKey}
        title="Users"
        data={[]}
        columns={columns}
        fields={userFields}
        entityName="User"
        entityKey="users"
        idField="id"
        mobileCardConfig={{
          titleField: 'name',
          fields: userCardFields
        }}
        customSubmitLogic={customSubmitLogic}
        hideActions={true}
        CustomDialog={UserFormDialog}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            setResetDialog(true);
            setAnchorEl(null);
          }}
          disabled={isCurrentUser(selectedUser)}
        >
          <VpnKey sx={{ mr: 1 }} color="warning" />
          Reset Password
        </MenuItem>
        {selectedUser?.isLocked ? (
          <MenuItem 
            onClick={() => {
              handleUnlockAccount(selectedUser?.id);
              setAnchorEl(null);
            }}
            disabled={isCurrentUser(selectedUser)}
          >
            <LockOpen sx={{ mr: 1 }} color="success" />
            Unlock Account
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={() => {
              handleToggleStatus(selectedUser?.id, selectedUser?.status || 'active');
              setAnchorEl(null);
            }}
            disabled={isCurrentUser(selectedUser)}
          >
            {selectedUser?.status === 'active' ? <Lock sx={{ mr: 1 }} color="error" /> : <LockOpen sx={{ mr: 1 }} color="success" />}
            {selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
        )}

      </Menu>

      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the password for {selectedUser?.name}?
            A new temporary password will be generated and you can copy a login link.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="warning">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* New User Success Dialog */}
      {newUserCredentials && (
        <UserCredentialsDialog
          open={!!newUserCredentials}
          onClose={() => setNewUserCredentials(null)}
          userDetails={{
            name: selectedUser?.name || 'User',
            email: newUserCredentials.email,
            password: newUserCredentials.password,
            hostelName: JSON.parse(localStorage.getItem('user') || '{}').hostelName || 'Hostel',
            role: 'user',
            loginUrl: `${window.location.origin}/login?email=${encodeURIComponent(newUserCredentials.email)}&password=${encodeURIComponent(newUserCredentials.password)}`
          }}
        />
      )}

      {/* Reset Password Success Dialog */}
      {resetCredentials && (
        <UserCredentialsDialog
          open={!!resetCredentials}
          onClose={() => setResetCredentials(null)}
          userDetails={{
            name: resetCredentials.name,
            email: resetCredentials.email,
            password: resetCredentials.password,
            hostelName: JSON.parse(localStorage.getItem('user') || '{}').hostelName || 'Hostel',
            role: 'user',
            loginUrl: `${window.location.origin}/login?email=${encodeURIComponent(resetCredentials.email)}&password=${encodeURIComponent(resetCredentials.password)}`
          }}
        />
      )}

      {/* Snackbar for notifications */}
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

export default UserManagement;