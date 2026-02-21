import React from 'react';
import { Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { roomFields } from '../../components/common/FormConfigs';
import RoomForm from './RoomForm';

const RoomList: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'roomNumber', headerName: 'Room', flex: 1, minWidth: 100 },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      width: 100
    },
    { 
      field: 'rent', 
      headerName: 'Rent', 
      width: 120,
      valueFormatter: (params: any) => `₹${Number(params || 0).toLocaleString()}`,
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
      title="Rooms"
      data={[]}
      customDataLoader={async () => {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        return await getAll('rooms');
      }}
      enableMobileFilters={true}
      searchFields={['roomNumber', 'type']}
      entityKey="rooms"
      columns={columns}
      fields={roomFields}
      entityName="Room"
      mobileCardConfig={{
        titleField: 'roomNumber',
        fields: [
          { key: 'type', label: 'Type', value: 'type' },
          { key: 'capacity', label: 'Capacity', value: 'capacity' },
          { key: 'rent', label: 'Rent', value: 'rent', render: (value: number) => `₹${Number(value || 0).toLocaleString()}` },
          { key: 'status', label: 'Status', value: 'status' }
        ]
      }}
      CustomDialog={RoomForm}
    />
  );
};

export default RoomList;
