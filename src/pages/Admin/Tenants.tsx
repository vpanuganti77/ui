import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Chip,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import TenantDialog from '../../components/tenant/TenantDialog';
import { tenantFields } from '../../components/common/FormConfigs';
import { tenantCardFields } from '../../components/common/MobileCardConfigs';

const initialTenants: any[] = [];

const Tenants: React.FC = () => {
  const navigate = useNavigate();

  const handleItemClick = (id: string) => {
    navigate(`/admin/tenants/${id}`);
  };

  const customSubmitLogic = (formData: any, editingItem: any) => {
    if (editingItem) {
      return {
        ...editingItem,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        room: formData.roomId,
        rent: parseInt(formData.rent),
        deposit: parseInt(formData.deposit),
        joiningDate: formData.joiningDate,
        aadharNumber: formData.aadharNumber,
        aadharFront: formData.aadharFront,
        aadharBack: formData.aadharBack
      };
    } else {
      return {
        id: (Math.random() * 1000).toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        room: formData.roomId,
        roomType: 'single',
        rent: parseInt(formData.rent),
        deposit: parseInt(formData.deposit),
        status: 'active',
        joiningDate: formData.joiningDate,
        pendingDues: 0,
        lastModifiedBy: 'Admin',
        lastModifiedDate: new Date().toISOString(),
        aadharNumber: formData.aadharNumber,
        aadharFront: formData.aadharFront,
        aadharBack: formData.aadharBack
      };
    }
  };

  const additionalValidation = (formData: any) => {
    if (!formData.aadharFront || !formData.aadharBack) {
      return 'Aadhar card photos are mandatory';
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'vacated': return 'default';
      case 'notice': return 'warning';
      default: return 'default';
    }
  };



  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150
    },
    { field: 'phone', headerName: 'Mobile', width: 120 },
    { field: 'room', headerName: 'Room', width: 80 },
    { 
      field: 'rent', 
      headerName: 'Rent', 
      width: 120,
      valueFormatter: (params: any) => {
        if (!params) return '₹0';
        const value = params.value || params.row?.rent || 0;
        return `₹${value.toLocaleString()}`;
      },
      align: 'right',
      headerAlign: 'right'
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
        />
      )
    },
    {
      field: 'pendingDues',
      headerName: 'Dues',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        if (!params) return '-';
        const value = params.value || params.row?.pendingDues || 0;
        return value > 0 ? `₹${value.toLocaleString()}` : '-';
      },
      cellClassName: (params: any) => (params.value && params.value > 0) ? 'text-error' : '',
      align: 'right',
      headerAlign: 'right'
    }
  ];



  return (
    <ListPage
      title="Tenants"
      data={initialTenants}
      entityKey="tenants"
      columns={columns}
      fields={tenantFields}
      entityName="Tenant"
      onItemClick={handleItemClick}
      mobileCardConfig={{
        titleField: 'name',
        fields: [
          { key: 'phone', label: 'Phone', value: 'phone' },
          { key: 'roomId', label: 'Room', value: 'roomId' },
          { key: 'rent', label: 'Rent', value: 'rent', render: (value: any) => value ? `₹${Number(value).toLocaleString()}` : '₹0' },
          { key: 'status', label: 'Status', value: 'status' },
          { key: 'pendingDues', label: 'Dues', value: 'pendingDues', render: (value: any) => value && value > 0 ? `₹${Number(value).toLocaleString()}` : '-' }
        ]
      }}
      customSubmitLogic={customSubmitLogic}
      additionalValidation={additionalValidation}
      CustomDialog={TenantDialog}
    />
  );
};

export default Tenants;