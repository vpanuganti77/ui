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
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Lock, LockOpen, VpnKey, Edit, Delete, MoreVert } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';
import { userFields } from '../../components/common/FormConfigs';
import { userCardFields } from '../../components/common/MobileCardConfigs';
import { getAll, create, update, getById, remove } from '../../services/fileDataService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetDialog, setResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await getAll('users');
      // Filter users by current user's hostelId for multi-tenant isolation
      const userData = localStorage.getItem('user');
      if (userData) {
        const currentUser = JSON.parse(userData);
        if (currentUser.role === 'admin' && currentUser.hostelId) {
          // Admin can only see users from their hostel
          const hostelUsers = allUsers.filter((user: any) => 
            user.hostelId === currentUser.hostelId || user.id === currentUser.id
          );
          setUsers(hostelUsers);
        } else {
          // Master admin can see all users
          setUsers(allUsers);
        }
      } else {
        setUsers(allUsers);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const customSubmitLogic = async (formData: any, editingItem: any) => {
    if (editingItem) {
      await update('users', editingItem.id, formData);
      await fetchUsers();
      return editingItem;
    } else {
      const newUser = {
        ...formData,
        id: Date.now().toString(),
        password: formData.password || 'user123',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      await create('users', newUser);
      await fetchUsers();
      return newUser;
    }
  };

  const handleResetPassword = async () => {
    try {
      const newPassword = 'user' + Math.random().toString(36).substring(2, 8);
      await update('users', selectedUser.id, { 
        ...selectedUser, 
        password: newPassword 
      });
      alert(`Password reset successfully. New password: ${newPassword}`);
      setResetDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      alert('Failed to reset password');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (userId === currentUserId) {
      alert('You cannot change your own account status');
      return;
    }
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const user = await getById('users', userId);
      await update('users', userId, { ...user, status: newStatus });
      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      alert('You cannot delete your own account');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await remove('users', userId);
        alert('User deleted successfully');
        fetchUsers();
      } catch (error: any) {
        alert('Failed to delete user');
      }
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
      renderCell: (params) => (
        <Chip 
          label={params.value || 'active'} 
          color={getStatusColor(params.value || 'active') as any}
          size="small"
          variant="filled"
        />
      )
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
        title="Users"
        data={users}
        columns={columns}
        fields={userFields}
        entityName="User"
        idField="id"
        mobileCardConfig={{
          titleField: 'name',
          fields: userCardFields
        }}
        customSubmitLogic={customSubmitLogic}
        hideActions={true}
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
        <MenuItem 
          onClick={() => {
            handleDeleteUser(selectedUser?.id);
            setAnchorEl(null);
          }}
          disabled={isCurrentUser(selectedUser)}
        >
          <Delete sx={{ mr: 1 }} color="error" />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the password for {selectedUser?.name}?
            A new temporary password will be sent to their email.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="warning">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagement;