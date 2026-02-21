import React from 'react';
import { Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { roomFields } from '../../components/common/FormConfigs';
import RoomForm from './RoomForm';
import { getAll } from '../../shared/services/storage/fileDataService';

const RoomList: React.FC = () => {
  const customDeleteValidation = async (room: any): Promise<string | null> => {
    try {
      const tenants = await getAll('tenants');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const associatedTenants = tenants.filter((tenant: any) => {
        const isInSameHostel = tenant.hostelId === user.hostelId;
        const isInThisRoom = tenant.roomId === room.roomNumber || tenant.room === room.roomNumber;
        const isActive = tenant.status === 'active';
        
        return isInSameHostel && isInThisRoom && isActive;
      });
      
      if (associatedTenants.length > 0) {
        const tenantNames = associatedTenants.map((t: any) => t.name).join(', ');
        return `Cannot delete room ${room.roomNumber}. It has ${associatedTenants.length} active tenant(s): ${tenantNames}. Please move or remove the tenant(s) first.`;
      }
      
      return null;
    } catch (error) {
      console.error('Error validating room deletion:', error);
      return 'Error checking room associations. Please try again.';
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
      field: 'amenities',
      headerName: 'Amenities',
      flex: 2,
      minWidth: 200
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
          { key: 'amenities', label: 'Amenities', value: 'amenities' }
        ]
      }}
      CustomDialog={RoomForm}
      customDeleteValidation={customDeleteValidation}
    />
  );
};

export default RoomList;
