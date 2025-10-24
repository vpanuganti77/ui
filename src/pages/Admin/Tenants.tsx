import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Chip,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import TenantDialog from '../../components/tenant/TenantDialog';
import TenantCredentialsDialog from '../../components/tenant/TenantCredentialsDialog';
import { tenantFields } from '../../components/common/FormConfigs';
import { tenantCardFields } from '../../components/common/MobileCardConfigs';

const initialTenants: any[] = [];

const Tenants: React.FC = () => {
  const navigate = useNavigate();
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    credentials: any;
    tenantName: string;
  }>({ open: false, credentials: null, tenantName: '' });

  const handleItemClick = (id: string) => {
    navigate(`/admin/tenants/${id}`);
  };

  const customSubmitLogic = (formData: any, editingItem: any) => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const hostelId = user?.hostelId || '';
    
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
        aadharBack: formData.aadharBack,
        hostelId
      };
    }
  };
  
  const handleAfterCreate = (newItem: any) => {
    if (newItem.userCredentials) {
      setCredentialsDialog({
        open: true,
        credentials: newItem.userCredentials,
        tenantName: newItem.name
      });
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
      width: 100,
      valueFormatter: (params: any) => {
        if (!params) return '-';
        const value = params.value || params.row?.pendingDues || 0;
        return value > 0 ? `₹${value.toLocaleString()}` : '-';
      },
      cellClassName: (params: any) => (params.value && params.value > 0) ? 'text-error' : '',
      align: 'right',
      headerAlign: 'right'
    },
    {
      field: 'nextDueDate',
      headerName: 'Next Due',
      width: 120,
      valueFormatter: (params: any) => {
        if (!params || !params.value) {
          // Calculate from joining date if nextDueDate is not set
          const joiningDate = params.row?.joiningDate;
          if (joiningDate) {
            const joining = new Date(joiningDate);
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            // Calculate next due date on the same day of month as joining date
            let nextDue = new Date(currentYear, currentMonth, joining.getDate());
            
            // If this month's due date has passed, move to next month
            if (nextDue <= today) {
              nextDue = new Date(currentYear, currentMonth + 1, joining.getDate());
            }
            
            return nextDue.toLocaleDateString();
          }
          return 'N/A';
        }
        return new Date(params.value).toLocaleDateString();
      }
    }
  ];



  return (
    <>
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
            { key: 'pendingDues', label: 'Dues', value: 'pendingDues', render: (value: any) => value && value > 0 ? `₹${Number(value).toLocaleString()}` : '-' },
            { key: 'nextDueDate', label: 'Next Due', value: 'nextDueDate', render: (value: any, item: any) => {
              if (value) return new Date(value).toLocaleDateString();
              if (item.joiningDate) {
                const joining = new Date(item.joiningDate);
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                
                // Calculate next due date on the same day of month as joining date
                let nextDue = new Date(currentYear, currentMonth, joining.getDate());
                
                // If this month's due date has passed, move to next month
                if (nextDue <= today) {
                  nextDue = new Date(currentYear, currentMonth + 1, joining.getDate());
                }
                
                return nextDue.toLocaleDateString();
              }
              return 'N/A';
            }}
          ]
        }}
        customSubmitLogic={customSubmitLogic}
        additionalValidation={additionalValidation}
        CustomDialog={TenantDialog}
        onAfterCreate={handleAfterCreate}
      />
      
      <TenantCredentialsDialog
        open={credentialsDialog.open}
        onClose={() => setCredentialsDialog({ open: false, credentials: null, tenantName: '' })}
        credentials={credentialsDialog.credentials}
        tenantName={credentialsDialog.tenantName}
      />
    </>
  );
};

export default Tenants;