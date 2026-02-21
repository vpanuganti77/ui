import React from 'react';
import { Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { staffFields } from '../../components/common/FormConfigs';
import StaffForm from './StaffForm';

const StaffList: React.FC = () => {
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 },
    { 
      field: 'salary', 
      headerName: 'Salary', 
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
          color={params.value === 'active' ? 'success' : 'default'} 
          size="small" 
          variant="filled"
        />
      )
    }
  ];

  return (
    <ListPage
      title="Staff"
      data={[]}
      customDataLoader={async () => {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        return await getAll('staff');
      }}
      enableMobileFilters={true}
      searchFields={['name', 'role', 'phone']}
      entityKey="staff"
      columns={columns}
      fields={staffFields}
      entityName="Staff"
      mobileCardConfig={{
        titleField: 'name',
        fields: [
          { key: 'role', label: 'Role', value: 'role' },
          { key: 'phone', label: 'Phone', value: 'phone' },
          { key: 'department', label: 'Department', value: 'department' },
          { key: 'salary', label: 'Salary', value: 'salary', render: (value: number) => `₹${value.toLocaleString()}` },
          { key: 'status', label: 'Status', value: 'status' }
        ]
      }}
      CustomDialog={StaffForm}
    />
  );
};

export default StaffList;
