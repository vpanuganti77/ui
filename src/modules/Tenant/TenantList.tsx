import React from 'react';
import { Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { tenantFields } from '../../components/common/FormConfigs';
import TenantForm from './TenantForm';

const TenantList: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'notice': return 'warning';
      default: return 'default';
    }
  };

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
    }
  ];

  return (
    <ListPage
      title="Tenants"
      data={[]}
      customDataLoader={async () => {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        return await getAll('tenants');
      }}
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
          { key: 'status', label: 'Status', value: 'status' }
        ]
      }}
      CustomDialog={TenantForm}
    />
  );
};

export default TenantList;
