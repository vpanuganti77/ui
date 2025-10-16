import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { Hotel, AttachMoney, CalendarToday, People } from '@mui/icons-material';

const MyRoom: React.FC = () => {
  const roomData = {
    roomNumber: 'R001',
    type: 'single',
    rent: 8000,
    deposit: 16000,
    joiningDate: '2024-01-15',
    floor: 1,
    amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'],
    capacity: 1,
    occupancy: 1
  };

  const tenantData = {
    name: 'Tenant User',
    email: 'tenant1@example.com',
    phone: '9876543210',
    pendingDues: 0,
    nextDueDate: '2024-04-05'
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Room
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Room Details */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Hotel color="primary" />
                <Typography variant="h5">Room {roomData.roomNumber}</Typography>
                <Chip label={roomData.type} color="primary" size="small" />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Floor
                </Typography>
                <Typography variant="body1">
                  {roomData.floor}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Capacity
                </Typography>
                <Typography variant="body1">
                  {roomData.occupancy}/{roomData.capacity} occupied
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Amenities
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {roomData.amenities.map((amenity, index) => (
                    <Chip key={index} label={amenity} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Rent Details */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AttachMoney color="primary" />
                <Typography variant="h5">Rent Details</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Monthly Rent
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{roomData.rent.toLocaleString()}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Security Deposit
                </Typography>
                <Typography variant="body1">
                  ₹{roomData.deposit.toLocaleString()}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Joining Date
                </Typography>
                <Typography variant="body1">
                  {new Date(roomData.joiningDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Next Due Date
                </Typography>
                <Typography variant="body1">
                  {new Date(tenantData.nextDueDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              {tenantData.pendingDues > 0 ? (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Pending Dues
                  </Typography>
                  <Typography variant="h6" color="error">
                    ₹{tenantData.pendingDues.toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Payment Status
                  </Typography>
                  <Chip label="All Clear" color="success" size="small" />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Personal Details */}
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <People color="primary" />
                <Typography variant="h5">Personal Details</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {tenantData.name}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {tenantData.email}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="body2" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {tenantData.phone}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default MyRoom;