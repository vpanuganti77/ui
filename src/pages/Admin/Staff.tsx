import React from 'react';
import { Chip, Typography, Avatar, Box } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { staffFields } from '../../components/common/FormConfigs';
import { staffCardFields } from '../../components/common/MobileCardConfigs';

const initialStaff: any[] = [];

const Staff: React.FC = () => {
  const customSubmitLogic = (formData: any, editingItem: any) => {
    if (editingItem) {
      return {
        ...editingItem,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        salary: parseInt(formData.salary),
        joiningDate: formData.joiningDate,
        shift: formData.shift,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        lastModifiedBy: 'Admin',
        lastModifiedDate: new Date().toISOString()
      };
    } else {
      return {
        _id: (Math.random() * 1000).toString(),
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        salary: parseInt(formData.salary),
        joiningDate: formData.joiningDate,
        shift: formData.shift,
        status: 'active',
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        lastModifiedBy: 'Admin',
        lastModifiedDate: new Date().toISOString()
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on-leave': return 'warning';
      default: return 'default';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'day': return 'primary';
      case 'night': return 'secondary';
      case 'rotating': return 'info';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
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
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      valueFormatter: (params: any) => {
        if (!params) return '₹0';
        const value = params.value || params.row?.salary || 0;
        return `₹${value.toLocaleString()}`;
      },
      align: 'right',
      headerAlign: 'right'
    },
    {
      field: 'shift',
      headerName: 'Shift',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getShiftColor(params.value) as any}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="filled"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    }
  ];

  return (
    <ListPage
      title="Staff Management"
      data={initialStaff}
      columns={columns}
      fields={staffFields}
      entityName="Staff"
      entityKey="staff"
      idField="_id"
      mobileCardConfig={{
        titleField: 'name',
        fields: staffCardFields
      }}
      customSubmitLogic={customSubmitLogic}
    />
  );
};

export default Staff;