import React, { useState, useEffect } from 'react';
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
  const [roomData, setRoomData] = useState<any>(null);
  const [tenantData, setTenantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { getAll } = await import('../../services/fileDataService');
        
        // Get tenant data
        const tenants = await getAll('tenants');
        console.log('User:', user);
        console.log('All tenants:', tenants);
        const tenant = tenants.find((t: any) => 
          t.email === user.email || 
          t.name === user.name ||
          t.email?.toLowerCase() === user.email?.toLowerCase()
        );
        console.log('Found tenant:', tenant);
        
        if (tenant) {
          setTenantData(tenant);
          
          // Get room data
          const rooms = await getAll('rooms');
          const room = rooms.find((r: any) => r.roomNumber === tenant.room || r.id === tenant.roomId);
          
          if (room) {
            setRoomData({
              ...room,
              amenities: Array.isArray(room.amenities) ? room.amenities : (room.amenities ? room.amenities.split(',').map((a: string) => a.trim()) : [])
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading room data:', error);
        setLoading(false);
      }
    };
    
    loadRoomData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography>Loading...</Typography></Box>;
  }

  if (!roomData || !tenantData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography>Room data not found</Typography></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Room
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Room Details */}
        <Card elevation={3}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Hotel color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Room {roomData?.roomNumber || 'N/A'}</Typography>
                <Chip label={roomData?.type || 'N/A'} color="primary" size="small" sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, flex: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Floor
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {roomData?.floor || 'N/A'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Occupancy
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {roomData?.occupancy || 0}/{roomData?.capacity || 0}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                Amenities
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(roomData?.amenities || []).map((amenity: string, index: number) => (
                  <Chip key={index} label={amenity} size="small" variant="outlined" color="primary" />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Rent Details */}
        <Card elevation={3}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <AttachMoney color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Rent Details</Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, flex: 1 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Monthly Rent
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                  ₹{Number(roomData?.rent || 0).toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Security Deposit
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₹{Number(roomData?.deposit || tenantData?.deposit || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Joining Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {tenantData?.joiningDate ? new Date(tenantData.joiningDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: (tenantData?.pendingDues || 0) > 0 ? 'error.50' : 'success.50', borderRadius: 2, textAlign: 'center' }}>
                {(tenantData?.pendingDues || 0) > 0 ? (
                  <>
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Pending Dues
                    </Typography>
                    <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
                      ₹{Number(tenantData.pendingDues).toLocaleString()}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Payment Status
                    </Typography>
                    <Chip label="All Clear" color="success" variant="filled" />
                  </>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Personal Details - Full Width */}
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <People color="info" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Personal Details</Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                Full Name
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {tenantData?.name || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                Email Address
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                {tenantData?.email || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                Phone Number
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {tenantData?.phone || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyRoom;