import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [room, setRoom] = useState({
    id: 'R001',
    number: 'R001',
    type: 'single',
    capacity: 1,
    currentOccupancy: 1,
    rent: 8000,
    deposit: 16000,
    status: 'occupied',
    floor: 1,
    amenities: 'AC, WiFi, Attached Bathroom',
    tenant: 'John Doe',
    tenantId: 'T001',
    lastModifiedBy: 'Admin',
    lastModifiedDate: '2024-03-15T10:30:00Z'
  });
  const [editData, setEditData] = useState({ ...room });
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const itemsPerPage = 6;

  // Mock room history data
  const roomHistory = [
    { id: '1', tenantName: 'John Doe', phone: '9876543210', checkIn: '2024-01-15', checkOut: null, duration: '2 months 15 days', status: 'current' },
    { id: '2', tenantName: 'Mike Johnson', phone: '9876543211', checkIn: '2023-10-01', checkOut: '2024-01-10', duration: '3 months 10 days', status: 'vacated' },
    { id: '3', tenantName: 'Sarah Wilson', phone: '9876543212', checkIn: '2023-07-15', checkOut: '2023-09-30', duration: '2 months 15 days', status: 'vacated' },
    { id: '4', tenantName: 'David Brown', phone: '9876543213', checkIn: '2023-04-01', checkOut: '2023-07-10', duration: '3 months 10 days', status: 'vacated' },
    { id: '5', tenantName: 'Lisa Davis', phone: '9876543214', checkIn: '2023-01-15', checkOut: '2023-03-30', duration: '2 months 15 days', status: 'vacated' },
    { id: '6', tenantName: 'Tom Anderson', phone: '9876543215', checkIn: '2022-11-01', checkOut: '2023-01-10', duration: '2 months 10 days', status: 'vacated' },
    { id: '7', tenantName: 'Emma Taylor', phone: '9876543216', checkIn: '2022-08-15', checkOut: '2022-10-30', duration: '2 months 15 days', status: 'vacated' },
    { id: '8', tenantName: 'James Wilson', phone: '9876543217', checkIn: '2022-05-01', checkOut: '2022-08-10', duration: '3 months 10 days', status: 'vacated' },
  ];

  // Mock complaints data for this room
  const roomComplaints = [
    { id: '1', tenantName: 'John Doe', category: 'Maintenance', title: 'AC not working', description: 'Air conditioner stopped working since yesterday', status: 'open', priority: 'high', date: '2024-03-10', resolvedDate: null },
    { id: '2', tenantName: 'John Doe', category: 'Cleanliness', title: 'Bathroom cleaning', description: 'Bathroom needs deep cleaning', status: 'resolved', priority: 'medium', date: '2024-03-05', resolvedDate: '2024-03-06' },
    { id: '3', tenantName: 'Mike Johnson', category: 'Electrical', title: 'Power socket issue', description: 'One power socket not working', status: 'resolved', priority: 'low', date: '2024-01-20', resolvedDate: '2024-01-22' },
    { id: '4', tenantName: 'Mike Johnson', category: 'Plumbing', title: 'Water pressure low', description: 'Water pressure is very low in shower', status: 'resolved', priority: 'medium', date: '2024-01-15', resolvedDate: '2024-01-18' },
    { id: '5', tenantName: 'Sarah Wilson', category: 'Noise', title: 'Loud neighbors', description: 'Neighbors making noise late at night', status: 'resolved', priority: 'medium', date: '2023-08-10', resolvedDate: '2023-08-12' },
    { id: '6', tenantName: 'Sarah Wilson', category: 'Maintenance', title: 'Door lock issue', description: 'Room door lock is loose', status: 'resolved', priority: 'high', date: '2023-07-25', resolvedDate: '2023-07-26' },
    { id: '7', tenantName: 'David Brown', category: 'Cleanliness', title: 'Window cleaning', description: 'Windows need cleaning', status: 'resolved', priority: 'low', date: '2023-05-15', resolvedDate: '2023-05-16' },
    { id: '8', tenantName: 'David Brown', category: 'Electrical', title: 'Light bulb replacement', description: 'Ceiling light bulb needs replacement', status: 'resolved', priority: 'low', date: '2023-04-20', resolvedDate: '2023-04-21' },
  ];

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

  const handleSave = () => {
    setRoom({ ...editData, lastModifiedBy: 'Admin', lastModifiedDate: new Date().toISOString() });
    setEditOpen(false);
  };

  const handleCancel = () => {
    setEditData({ ...room });
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
            ? `₹${parseInt(value).toLocaleString()}` 
            : value}
        </Typography>
      )}
    </Box>
  );

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
                  <InfoField label="Room Number" value={room.number} />
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
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Edit Room - {room.number}</Typography>
            <IconButton onClick={() => setEditOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Room Number"
              value={editData.number}
              onChange={(e) => setEditData({ ...editData, number: e.target.value })}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <Select
                value={editData.type}
                onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                displayEmpty
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="double">Double</MenuItem>
                <MenuItem value="triple">Triple</MenuItem>
                <MenuItem value="dormitory">Dormitory</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Capacity"
              type="number"
              value={editData.capacity}
              onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) })}
              fullWidth
              size="small"
            />
            <TextField
              label="Floor"
              type="number"
              value={editData.floor}
              onChange={(e) => setEditData({ ...editData, floor: parseInt(e.target.value) })}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <Select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                displayEmpty
              >
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="vacant">Vacant</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Monthly Rent"
              type="number"
              value={editData.rent}
              onChange={(e) => setEditData({ ...editData, rent: parseInt(e.target.value) })}
              fullWidth
              size="small"
            />
            <TextField
              label="Security Deposit"
              type="number"
              value={editData.deposit}
              onChange={(e) => setEditData({ ...editData, deposit: parseInt(e.target.value) })}
              fullWidth
              size="small"
            />
            <TextField
              label="Amenities"
              value={editData.amenities}
              onChange={(e) => setEditData({ ...editData, amenities: e.target.value })}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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
                {currentHistory.map((history) => (
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
                {currentComplaints.map((complaint) => (
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