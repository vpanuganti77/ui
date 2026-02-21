import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Card,
  CardContent,
  Box,
  Stack,
  CircularProgress,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Lock, LockOpen, VpnKey, Edit, Delete, MoreVert, ContentCopy } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';
import { userFields } from '../../components/common/FormConfigs';
import { userCardFields } from '../../components/common/MobileCardConfigs';
import { userService } from './service';
import { userValidation } from './validation';
import { User } from './types';
import UserCredentialsDialog from '../../components/UserCredentialsDialog';
import UserForm from './UserForm';

const UserList: React.FC = () => {
  const [resetDialog, setResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newUserCredentials, setNewUserCredentials] = useState<{email: string, password: string} | null>(null);
  const [resetCredentials, setResetCredentials] = useState<{name: string, email: string, password: string} | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    userDetails: any;
  }>({ open: false, userDetails: null });
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [usersData, hostelsData] = await Promise.all([
        userService.getAll(),
        import('../../shared/services/storage/fileDataService').then(m => m.getAll('hostels'))
      ]);
      
      const usersWithHostels = usersData.map((user: User) => {
        const hostel = hostelsData.find((h: any) => h.id === user.hostelId);
        return {
          ...user,
          hostelName: hostel?.displayName || hostel?.name || user.hostelName || 'N/A'
        };
      });
      
      setUsers(usersWithHostels);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      const newPassword = await userService.resetPassword(selectedUser.id);
      
      setResetCredentials({
        name: selectedUser.name,
        email: selectedUser.email,
        password: newPassword
      });
      
      setResetDialog(false);
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
      await userService.toggleStatus(userId);
      await loadUsers();
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
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
      await userService.unlockAccount(userId);
      await loadUsers();
      
      setSnackbar({ 
        open: true, 
        message: 'Account unlocked successfully', 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Failed to unlock account', severity: 'error' });
    }
  };

  const handleCopyCredentials = async (user: User) => {
    try {
      const fullUserData = await userService.getById(user.id);
      
      setCredentialsDialog({
        open: true,
        userDetails: {
          name: fullUserData.name,
          email: fullUserData.email,
          password: fullUserData.password,
          hostelName: fullUserData.hostelName || user.hostelName || 'N/A',
          role: fullUserData.role,
          loginUrl: null,
          isNewUser: false
        }
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch user credentials', 
        severity: 'error' 
      });
    }
  };

  const getStatusColor = useCallback((status: string) => {
    return status === 'active' ? 'success' : 'error';
  }, []);

  const getRoleColor = useCallback((role: string) => {
    return role === 'admin' ? 'primary' : 'default';
  }, []);

  const isCurrentUser = useCallback((user: User) => {
    if (!user || !currentUserId) return false;
    return user.id === currentUserId;
  }, [currentUserId]);

  const handleMenuClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, row: User) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedUser(row);
  }, []);

  const columns: GridColDef[] = useMemo(() => [
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
      field: 'hostelName', 
      headerName: 'Hostel', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      )
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
          onClick={(e) => handleMenuClick(e, params.row)}
          disabled={isCurrentUser(params.row)}
        >
          <MoreVert />
        </Button>
      )
    }
  ], [currentUserId, handleMenuClick, getRoleColor, getStatusColor, isCurrentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <>
      <ListPage
        title="Users"
        data={users}
        columns={columns}
        fields={userFields}
        entityName="User"
        entityKey="users"
        idField="id"
        enableMobileFilters={true}
        searchFields={['name', 'email', 'phone']}
        filterOptions={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'admin', label: '👑 Admin' },
              { value: 'receptionist', label: '🏨 Receptionist' },
              { value: 'tenant', label: '👤 Tenant' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: '🟢 Active' },
              { value: 'inactive', label: '🔴 Inactive' },
              { value: 'locked', label: '🔒 Locked' }
            ]
          }
        ]}
        sortOptions={[
          { key: 'name', label: '👤 Name A-Z', order: 'asc' as const },
          { key: 'name', label: '👤 Name Z-A', order: 'desc' as const },
          { key: 'role', label: '👑 Role', order: 'asc' as const },
          { key: 'createdAt', label: '📅 Newest First', order: 'desc' as const }
        ]}
        filterFields={{
          role: (item) => item.role,
          status: (item) => item.isLocked ? 'locked' : (item.status || 'active')
        }}
        sortFields={{
          name: (a, b) => a.name.localeCompare(b.name),
          role: (a, b) => a.role.localeCompare(b.role),
          createdAt: (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        }}
        renderMobileCard={(item, onEdit, onDelete) => (
          <Card 
            key={item.id} 
            sx={{ 
              mb: 2,
              boxShadow: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ pb: '16px !important', p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '1.1rem',
                    color: 'text.primary'
                  }}
                >
                  {item.name}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setSelectedUser(item);
                  }}
                  disabled={isCurrentUser(item)}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  Actions
                </Button>
              </Box>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Email:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.email}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Phone:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.phone}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Role:</Typography>
                  <Chip 
                    label={item.role} 
                    color={getRoleColor(item.role) as any}
                    size="small"
                    variant="filled"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Status:</Typography>
                  {item.isLocked ? (
                    <Chip 
                      label="Locked" 
                      color="error"
                      size="small"
                      variant="filled"
                    />
                  ) : (
                    <Chip 
                      label={item.status || 'active'} 
                      color={getStatusColor(item.status || 'active') as any}
                      size="small"
                      variant="filled"
                    />
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Hostel:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.hostelName || 'N/A'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
        customDataLoader={async () => users}
        onAfterCreate={loadUsers}
        additionalValidation={userValidation.validateUniqueFields}
        hideActions={true}
        CustomDialog={UserForm}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedUser(null);
        }}
        disableAutoFocusItem
        disableRestoreFocus
      >
        <MenuItem 
          onClick={async () => {
            if (selectedUser) await handleCopyCredentials(selectedUser);
            setAnchorEl(null);
          }}
        >
          <ContentCopy sx={{ mr: 1 }} color="primary" />
          Copy Credentials
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setResetDialog(true);
            setAnchorEl(null);
          }}
          disabled={!selectedUser || isCurrentUser(selectedUser)}
        >
          <VpnKey sx={{ mr: 1 }} color="warning" />
          Reset Password
        </MenuItem>
        {selectedUser?.isLocked ? (
          <MenuItem 
            onClick={() => {
              if (selectedUser) handleUnlockAccount(selectedUser.id);
              setAnchorEl(null);
            }}
            disabled={!selectedUser || isCurrentUser(selectedUser)}
          >
            <LockOpen sx={{ mr: 1 }} color="success" />
            Unlock Account
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={() => {
              if (selectedUser) handleToggleStatus(selectedUser.id, selectedUser.status || 'active');
              setAnchorEl(null);
            }}
            disabled={!selectedUser || isCurrentUser(selectedUser)}
          >
            {selectedUser?.status === 'active' ? <Lock sx={{ mr: 1 }} color="error" /> : <LockOpen sx={{ mr: 1 }} color="success" />}
            {selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            setDeleteUserId(selectedUser?.id || null);
            setAnchorEl(null);
          }}
          disabled={!selectedUser || isCurrentUser(selectedUser)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} color="error" />
          Delete User
        </MenuItem>
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
            loginUrl: undefined
          }}
        />
      )}

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
            loginUrl: undefined
          }}
        />
      )}

      <UserCredentialsDialog
        open={credentialsDialog.open}
        onClose={() => setCredentialsDialog({ open: false, userDetails: null })}
        userDetails={credentialsDialog.userDetails}
      />

      <Dialog open={!!deleteUserId} onClose={() => setDeleteUserId(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserId(null)}>Cancel</Button>
          <Button 
            onClick={async () => {
              try {
                if (deleteUserId) {
                  await userService.delete(deleteUserId);
                  await loadUsers();
                  setSnackbar({ 
                    open: true, 
                    message: 'User deleted successfully', 
                    severity: 'success' 
                  });
                }
              } catch (error) {
                setSnackbar({ 
                  open: true, 
                  message: 'Failed to delete user', 
                  severity: 'error' 
                });
              }
              setDeleteUserId(null);
            }}
            color="error" 
            variant="contained"
          >
            Delete
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
    </>
  );
};

export default UserList;
