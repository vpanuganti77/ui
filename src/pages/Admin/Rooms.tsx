import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { roomFields } from '../../components/common/FormConfigs';
import { roomCardFields } from '../../components/common/MobileCardConfigs';

const initialRooms: any[] = [];

const Rooms: React.FC = () => {
  const navigate = useNavigate();

  const handleItemClick = (id: string) => {
    navigate(`/admin/rooms/${id}`);
  };

  const getTypeFromCapacity = (capacity: number) => {
    switch (capacity) {
      case 1: return 'single';
      case 2: return 'double';
      case 3: return 'triple';
      case 4: return 'quad';
      case 6:
      case 8: return 'dormitory';
      default: return 'shared';
    }
  };

  const customSubmitLogic = (formData: any, editingItem: any) => {
    const capacity = parseInt(formData.capacity);
    const type = getTypeFromCapacity(capacity);
    
    // Get current user's hostelId
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const hostelId = user?.hostelId || '';
    
    if (editingItem) {
      return {
        ...editingItem,
        roomNumber: formData.roomNumber,
        type,
        capacity,
        rent: parseInt(formData.rent),
        floor: parseInt(formData.floor),
        amenities: formData.amenities.split(',').map((a: string) => a.trim())
      };
    } else {
      return {
        roomNumber: formData.roomNumber,
        type,
        capacity,
        rent: parseInt(formData.rent),
        occupancy: 0,
        status: 'available',
        floor: parseInt(formData.floor),
        amenities: formData.amenities.split(',').map((a: string) => a.trim()),
        lastModifiedBy: 'Admin',
        lastModifiedDate: new Date().toISOString(),
        hostelId
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'roomNumber', 
      headerName: 'Room', 
      flex: 1, 
      minWidth: 100
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => {
        const typeLabels: { [key: string]: string } = {
          single: 'Single',
          double: 'Double',
          triple: 'Triple',
          quad: 'Quad',
          dormitory: 'Dormitory',
          shared: 'Shared'
        };
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {typeLabels[params.value] || params.value}
          </Typography>
        );
      }
    },
    {
      field: 'occupancy',
      headerName: 'Occupancy',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.occupancy}/{params.row.capacity}
        </Typography>
      )
    },
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
      flex: 1,
      minWidth: 120,
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
      title="Rooms"
      data={initialRooms}
      columns={columns}
      fields={roomFields}
      entityName="Room"
      entityKey="rooms"
      idField="id"
      onItemClick={handleItemClick}
      mobileCardConfig={{
        titleField: 'roomNumber',
        fields: [
          { key: 'type', label: 'Type', value: 'type', render: (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-' },
          { key: 'occupancy', label: 'Occupancy', value: 'occupancy', render: (value: number, item: any) => `${value || 0}/${item?.capacity || 0}` },
          { key: 'rent', label: 'Rent', value: 'rent', render: (value: number) => value ? `₹${value.toLocaleString()}` : '₹0' },
          { key: 'status', label: 'Status', value: 'status' },
          { key: 'floor', label: 'Floor', value: 'floor' }
        ]
      }}
      customSubmitLogic={customSubmitLogic}
    />
  );
};

export default Rooms;