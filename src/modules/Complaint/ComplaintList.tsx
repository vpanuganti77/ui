import React from 'react';
import { Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { complaintFields } from '../../components/common/FormConfigs';
import ComplaintForm from './ComplaintForm';

const ComplaintList: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'tenantName', headerName: 'Tenant', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} color={getPriorityColor(params.value)} size="small" />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
      )
    }
  ];

  return (
    <ListPage
      title="Complaints"
      data={[]}
      customDataLoader={async () => {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        return await getAll('complaints');
      }}
      enableMobileFilters={true}
      searchFields={['tenantName', 'category', 'description']}
      entityKey="complaints"
      columns={columns}
      fields={complaintFields}
      entityName="Complaint"
      mobileCardConfig={{
        titleField: 'tenantName',
        fields: [
          { key: 'category', label: 'Category', value: 'category' },
          { key: 'description', label: 'Description', value: 'description' },
          { key: 'priority', label: 'Priority', value: 'priority' },
          { key: 'status', label: 'Status', value: 'status' }
        ]
      }}
      CustomDialog={ComplaintForm}
    />
  );
};

export default ComplaintList;
