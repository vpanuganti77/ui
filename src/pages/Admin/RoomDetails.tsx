import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getById, getAll, update } from '../../services/fileDataService';
import DynamicDialog from '../../components/common/DynamicDialog';
import { roomFields } from '../../components/common/FormConfigs';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ArrowBack, Edit, Home, Person, Save, Cancel, Bed, Close, History, ReportProblem, ExpandMore } from '@mui/icons-material';

const RoomDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>({});
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    loadRoomData();
  }, [id]);

  const loadRoomData = async () => {
    try {
      if (!id) return;
      const [roomData, tenants, complaints] = await Promise.all([
        getById('rooms', id),
        getAll('tenants'),
        getAll('complaints')
      ]);
      
      // Find tenant assigned to this room
      const assignedTenant = tenants.find(tenant => 
        tenant.room === roomData.roomNumber || tenant.roomId === roomData.id
      );
      
      // Get room complaints
      const roomComplaints = complaints.filter(complaint => 
        complaint.room === roomData.roomNumber || complaint.roomId === roomData.id
      );
      
      // Get room history from tenants
      const roomHistory = tenants.filter(tenant => 
        tenant.room === roomData.roomNumber || tenant.roomId === roomData.id
      ).map(tenant => ({
        id: tenant.id,
        tenantName: tenant.name,
        phone: tenant.phone,
        checkIn: tenant.joiningDate,
        checkOut: tenant.vacatingDate || null,
        status: tenant.vacatingDate ? 'vacated' : 'current'
      }));
      
      const roomWithTenant = {
        ...roomData,
        roomNumber: roomData.roomNumber || roomData.number || 'N/A',
        rent: Number(roomData.rent) || 0,
        deposit: Number(roomData.deposit) || 0,
        capacity: Number(roomData.capacity) || 1,
        floor: Number(roomData.floor) || 1,
        tenant: assignedTenant?.name || null,
        tenantId: assignedTenant?.id || null,
        currentOccupancy: assignedTenant ? 1 : 0,
        status: assignedTenant ? 'occupied' : 'vacant',
        history: roomHistory,
        complaints: roomComplaints
      };
      
      setRoom(roomWithTenant);
      setEditData(roomWithTenant);
      setLoading(false);
    } catch (error) {
      console.error('Error loading room data:', error);
      setLoading(false);
    }
  };
  const [historyOpen, setHistoryOpen] = useState(false);
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const itemsPerPage = 6;



  const roomHistory = room?.history || [];
  const roomComplaints = room?.complaints || [];
  
  const totalPages = Math.ceil(roomHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHistory = roomHistory.slice(startIndex, startIndex + itemsPerPage);

  const totalComplaintsPages = Math.ceil(roomComplaints.length / itemsPerPage);
  const complaintsStartIndex = (complaintsPage - 1) * itemsPerPage;
  const currentComplaints = roomComplaints.slice(complaintsStartIndex, complaintsStartIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'success';
      case 'vacant': return 'primary';
      case 'maintenance': return 'warning';
      case 'reserved': return 'info';
      default: return 'default';
    }
  };

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const updatedRoom = await update('rooms', room.id, formData);
      setRoom({ ...updatedRoom, ...room }); // Preserve calculated fields
      setEditOpen(false);
      loadRoomData(); // Reload to get fresh data
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleCancel = () => {
    setEditOpen(false);
  };

  const InfoField = ({ label, value }: { label: string; value: any }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      {label === 'Status' ? (
        <Chip 
          label={value} 
          color={getStatusColor(value) as any}
          size="small"
          variant="filled"
        />
      ) : (
        <Typography variant="body1" sx={{ fontWeight: 400 }}>
          {label === 'Monthly Rent' || label === 'Security Deposit' 
            ? `₹${Number(value) || 0}` 
            : value}
        </Typography>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading room details...</Typography>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Room not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, maxWidth: '100%', mx: 'auto', height: '100vh', overflow: 'hidden' }}>
      {/* Content */}
      <Box display="flex" gap={1} flexWrap="wrap" height="100vh">
        {/* Main Content */}
        <Box flex="1" minWidth="600px" sx={{ overflow: 'auto' }}>
          <Stack spacing={1}>
            {/* Room Information */}
            <Accordion defaultExpanded elevation={2} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Bed color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Room Information
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                  <InfoField label="Room Number" value={room.roomNumber} />
                  <InfoField label="Room Type" value={room.type} />
                  <InfoField label="Status" value={room.status} />
                  <InfoField label="Capacity" value={room.capacity} />
                  <InfoField label="Current Occupancy" value={room.currentOccupancy} />
                  <InfoField label="Floor" value={room.floor} />
                  <InfoField label="Monthly Rent" value={room.rent} />
                  <InfoField label="Security Deposit" value={room.deposit} />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <InfoField label="Amenities" value={room.amenities} />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Current Tenant */}
            {room.tenant && (
              <Accordion defaultExpanded elevation={2} sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Person color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Current Tenant
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <InfoField label="Tenant Name" value={room.tenant} />
                    <InfoField label="Tenant ID" value={room.tenantId} />
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}


          </Stack>
        </Box>

        {/* Sidebar */}
        <Box width="250px" sx={{ overflow: 'auto' }}>
          <Card elevation={2}>
            <CardHeader 
              title="Quick Actions"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={1}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<History />} 
                  onClick={() => setHistoryOpen(true)}
                  sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, whiteSpace: 'nowrap' }}
                >
                  History
                </Button>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<ReportProblem />} 
                  onClick={() => setComplaintsOpen(true)}
                  sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }, whiteSpace: 'nowrap' }}
                >
                  Complaints
                </Button>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<Edit />} 
                  onClick={() => setEditOpen(true)}
                  sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }, whiteSpace: 'nowrap' }}
                >
                  Edit Room
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<ArrowBack />} 
                  onClick={() => navigate('/admin/rooms')}
                  sx={{ borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'grey.50' }, whiteSpace: 'nowrap' }}
                >
                  Back
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Audit Information */}
          <Card elevation={2} sx={{ mt: 1 }}>
            <CardHeader 
              title="Audit Trail"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Last Modified By
                </Typography>
                <Typography variant="body1">{room.lastModifiedBy}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Last Modified Date
                </Typography>
                <Typography variant="body1">
                  {new Date(room.lastModifiedDate).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Edit Room Dialog */}
      <DynamicDialog
        open={editOpen}
        onClose={handleCancel}
        onSubmit={handleSave}
        title={`Edit Room - ${room.roomNumber}`}
        fields={roomFields}
        editingItem={room}
        submitLabel="Room"
        maxWidth="sm"
      />

      {/* Room History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Room History - {room.number}</Typography>
            <IconButton onClick={() => setHistoryOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {roomHistory.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={4}
              textAlign="center"
            >
              <History sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Tenant History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This room has not been allocated to any tenant yet.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant Name</TableCell>
                      <TableCell>Mobile</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentHistory.map((history: any) => (
                      <TableRow key={history.id} hover>
                        <TableCell>
                          <Typography 
                            sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => navigate(`/admin/tenants/${history.id}`)}
                          >
                            {history.tenantName}
                          </Typography>
                        </TableCell>
                        <TableCell>{history.phone}</TableCell>
                        <TableCell>{new Date(history.checkIn).toLocaleDateString()}</TableCell>
                        <TableCell>{history.checkOut ? new Date(history.checkOut).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{history.duration}</TableCell>
                        <TableCell>
                          <Chip 
                            label={history.status} 
                            color={history.status === 'current' ? 'success' : 'default'}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination 
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complaints History Dialog */}
      <Dialog open={complaintsOpen} onClose={() => setComplaintsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Complaints History - Room {room.number}</Typography>
            <IconButton onClick={() => setComplaintsOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {roomComplaints.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={4}
              textAlign="center"
            >
              <ReportProblem sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Complaints Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No complaints have been filed for this room.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Resolved Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentComplaints.map((complaint: any) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Typography 
                            sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => navigate(`/admin/tenants/${complaint.id}`)}
                          >
                            {complaint.tenantName}
                          </Typography>
                        </TableCell>
                        <TableCell>{complaint.category}</TableCell>
                        <TableCell>{complaint.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={complaint.priority} 
                            color={getPriorityColor(complaint.priority) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={complaint.status} 
                            color={getComplaintStatusColor(complaint.status) as any}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>{complaint.resolvedDate ? new Date(complaint.resolvedDate).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination 
                  count={totalComplaintsPages}
                  page={complaintsPage}
                  onChange={(_, page) => setComplaintsPage(page)}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComplaintsOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomDetails;