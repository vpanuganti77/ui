import React from 'react';
import { Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { tenantFields } from '../../components/common/FormConfigs';
import TenantForm from './TenantForm';

const TenantList: React.FC = () => {
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'phone', headerName: 'Mobile', width: 120 },
    { field: 'roomId', headerName: 'Room', width: 80 },
    { 
      field: 'rent', 
      headerName: 'Rent', 
      width: 120,
      valueFormatter: (params: any) => `₹${(params || 0).toLocaleString()}`,
      align: 'right',
      headerAlign: 'right'
    },
    {
      field: 'joiningDate',
      headerName: 'Joined',
      width: 100,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
    }
  ];

  return (
    <ListPage
      title="Tenants"
      data={[]}
      enableMobileFilters={true}
      searchFields={['name', 'phone', 'roomId']}
      entityKey="tenants"
      columns={columns}
      fields={tenantFields}
      entityName="Tenant"
      mobileCardConfig={{
        titleField: 'name',
        fields: [
          { key: 'phone', label: 'Phone', value: 'phone' },
          { key: 'roomId', label: 'Room', value: 'roomId' },
          { key: 'rent', label: 'Rent', value: 'rent', render: (value: any) => `₹${Number(value || 0).toLocaleString()}` },
          { key: 'joiningDate', label: 'Joined', value: 'joiningDate', render: (value: string) => value ? new Date(value).toLocaleDateString() : '-' }
        ]
      }}
      CustomDialog={TenantForm}
    />
  );
};

export default TenantList;
