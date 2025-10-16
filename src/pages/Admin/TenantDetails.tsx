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
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Edit, Person, Home, Payment, History, Save, Cancel, Close, ExpandMore, ReportProblem } from '@mui/icons-material';

const TenantDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [editMode, setEditMode] = useState(false);
  const [tenant, setTenant] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    room: 'R001',
    roomType: 'single',
    rent: 8000,
    deposit: 16000,
    status: 'active',
    joiningDate: '2024-01-15',
    pendingDues: 0,
    gender: 'Male',
    aadharNumber: '1234-5678-9012',
    aadharFront: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    aadharBack: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    lastModifiedBy: 'Admin',
    lastModifiedDate: '2024-03-15T10:30:00Z'
  });
  const [editData, setEditData] = useState({ ...tenant });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const itemsPerPage = 10;

  // Mock payment history data
  const paymentHistory = [
    { id: '1', amount: 8000, type: 'rent', month: '2024-03', date: '2024-03-05', status: 'paid', method: 'online', txnId: 'TXN123456' },
    { id: '2', amount: 8000, type: 'rent', month: '2024-02', date: '2024-02-05', status: 'paid', method: 'cash', txnId: null },
    { id: '3', amount: 8000, type: 'rent', month: '2024-01', date: '2024-01-05', status: 'paid', method: 'online', txnId: 'TXN789012' },
    { id: '4', amount: 16000, type: 'deposit', month: '2024-01', date: '2024-01-15', status: 'paid', method: 'online', txnId: 'TXN345678' },
    { id: '5', amount: 8000, type: 'rent', month: '2023-12', date: '2023-12-05', status: 'paid', method: 'cash', txnId: null },
    { id: '6', amount: 8000, type: 'rent', month: '2023-11', date: '2023-11-05', status: 'paid', method: 'online', txnId: 'TXN901234' },
    { id: '7', amount: 8000, type: 'rent', month: '2023-10', date: '2023-10-05', status: 'paid', method: 'upi', txnId: 'UPI567890' },
    { id: '8', amount: 8000, type: 'rent', month: '2023-09', date: '2023-09-05', status: 'paid', method: 'online', txnId: 'TXN234567' },
    { id: '9', amount: 8000, type: 'rent', month: '2023-08', date: '2023-08-05', status: 'paid', method: 'cash', txnId: null },
    { id: '10', amount: 8000, type: 'rent', month: '2023-07', date: '2023-07-05', status: 'paid', method: 'online', txnId: 'TXN678901' },
    { id: '11', amount: 8000, type: 'rent', month: '2023-06', date: '2023-06-05', status: 'paid', method: 'upi', txnId: 'UPI123456' },
    { id: '12', amount: 8000, type: 'rent', month: '2023-05', date: '2023-05-05', status: 'paid', method: 'cash', txnId: null },
  ];

  // Mock complaints history data
  const complaintsHistory = [
    { id: '1', title: 'AC not working', category: 'maintenance', date: '2024-03-10', status: 'resolved', priority: 'high', description: 'Air conditioning unit stopped working' },
    { id: '2', title: 'Water leakage', category: 'plumbing', date: '2024-03-05', status: 'in-progress', priority: 'medium', description: 'Water leaking from bathroom ceiling' },
    { id: '3', title: 'Noise complaint', category: 'general', date: '2024-02-28', status: 'resolved', priority: 'low', description: 'Loud music from neighboring room' },
    { id: '4', title: 'WiFi issues', category: 'technical', date: '2024-02-20', status: 'resolved', priority: 'medium', description: 'Internet connection unstable' },
    { id: '5', title: 'Cleaning request', category: 'housekeeping', date: '2024-02-15', status: 'resolved', priority: 'low', description: 'Common area needs deep cleaning' },
    { id: '6', title: 'Door lock broken', category: 'maintenance', date: '2024-02-10', status: 'resolved', priority: 'high', description: 'Room door lock not functioning' },
    { id: '7', title: 'Food quality', category: 'food', date: '2024-02-05', status: 'resolved', priority: 'medium', description: 'Complaint about meal quality' },
    { id: '8', title: 'Electricity issue', category: 'electrical', date: '2024-01-30', status: 'resolved', priority: 'high', description: 'Power outage in room' },
    { id: '9', title: 'Laundry machine', category: 'maintenance', date: '2024-01-25', status: 'resolved', priority: 'medium', description: 'Washing machine not working' },
    { id: '10', title: 'Hot water', category: 'plumbing', date: '2024-01-20', status: 'resolved', priority: 'medium', description: 'No hot water in bathroom' },
    { id: '11', title: 'Room temperature', category: 'general', date: '2024-01-15', status: 'resolved', priority: 'low', description: 'Room too cold' },
    { id: '12', title: 'Pest control', category: 'housekeeping', date: '2024-01-10', status: 'resolved', priority: 'high', description: 'Cockroaches in room' },
  ];

  const totalPages = Math.ceil(paymentHistory.length / itemsPerPage);
  const totalComplaintsPages = Math.ceil(complaintsHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const complaintsStartIndex = (complaintsPage - 1) * itemsPerPage;
  const currentPayments = paymentHistory.slice(startIndex, startIndex + itemsPerPage);
  const currentComplaints = complaintsHistory.slice(complaintsStartIndex, complaintsStartIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'vacated': return 'default';
      case 'notice': return 'warning';
      default: return 'default';
    }
  };

  const handleSave = () => {
    setTenant({ ...editData, lastModifiedBy: 'Admin', lastModifiedDate: new Date().toISOString() });
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditData({ ...tenant });
    setEditMode(false);
  };

  const InfoField = ({ label, value, field, type = 'text', options }: any) => (
    <Box sx={{ mb: 0.8 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3, fontWeight: 500, fontSize: '0.75rem' }}>
        {label}
      </Typography>
      {editMode ? (
        field === 'status' ? (
          <FormControl size="small" fullWidth>
            <Select
              value={editData[field as keyof typeof editData]}
              onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="notice">Notice Period</MenuItem>
              <MenuItem value="vacated">Vacated</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <TextField
            size="small"
            fullWidth
            type={type}
            value={editData[field as keyof typeof editData]}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            InputLabelProps={type === 'date' ? { shrink: true } : undefined}
          />
        )
      ) : field === 'status' ? (
        <Chip 
          label={value} 
          color={getStatusColor(value) as any}
          size="small"
          variant="filled"
        />
      ) : (
        <Typography variant="body1" sx={{ fontWeight: 400, fontSize: '0.9rem' }}>
          {field === 'rent' || field === 'deposit' || field === 'pendingDues' 
            ? `₹${parseInt(value).toLocaleString()}` 
            : field === 'joiningDate' 
            ? new Date(value).toLocaleDateString()
            : value}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, md: 0.5 }, maxWidth: '100%', mx: 'auto' }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton onClick={() => navigate('/admin/tenants')} size="small">
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
            {tenant.name}
          </Typography>
          <IconButton onClick={() => setEditDialogOpen(true)} size="small">
            <Edit />
          </IconButton>
        </Box>
      )}
      
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
        {/* Main Content */}
        <Box flex="1" sx={{ minWidth: { xs: '100%', md: '600px' } }}>
          <Stack spacing={1}>
            <Accordion defaultExpanded elevation={2} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Person color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
                  <InfoField label="Full Name" value={tenant.name} field="name" />
                  <InfoField label="Email Address" value={tenant.email} field="email" type="email" />
                  <InfoField label="Phone Number" value={tenant.phone} field="phone" />
                  <InfoField label="Gender" value={tenant.gender} field="gender" />
                  <InfoField label="Aadhar Number" value={tenant.aadharNumber} field="aadharNumber" />
                  <InfoField label="Status" value={tenant.status} field="status" />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded elevation={2} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Home color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Room & Financial Details
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
                  <InfoField label="Room Number" value={tenant.room} field="room" />
                  <InfoField label="Room Type" value={tenant.roomType} field="roomType" />
                  <InfoField label="Monthly Rent" value={tenant.rent} field="rent" type="number" />
                  <InfoField label="Security Deposit" value={tenant.deposit} field="deposit" type="number" />
                  <InfoField label="Joining Date" value={tenant.joiningDate} field="joiningDate" type="date" />
                  <Box sx={{ mb: 0.8 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                      Pending Dues
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color={tenant.pendingDues > 0 ? 'error.main' : 'success.main'}
                      sx={{ fontWeight: 400, fontSize: '0.9rem' }}
                    >
                      {tenant.pendingDues > 0 ? `₹${tenant.pendingDues.toLocaleString()}` : 'No Dues'}
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion elevation={2} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Person color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Aadhar Documents
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                      Aadhar Front
                    </Typography>
                    {tenant.aadharFront ? (
                      <Box 
                        component="img" 
                        src={tenant.aadharFront} 
                        alt="Aadhar Front"
                        sx={{ 
                          width: '100%', 
                          maxWidth: 300, 
                          height: 'auto', 
                          border: '1px solid #ddd', 
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(tenant.aadharFront, '_blank')}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">No image available</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                      Aadhar Back
                    </Typography>
                    {tenant.aadharBack ? (
                      <Box 
                        component="img" 
                        src={tenant.aadharBack} 
                        alt="Aadhar Back"
                        sx={{ 
                          width: '100%', 
                          maxWidth: 300, 
                          height: 'auto', 
                          border: '1px solid #ddd', 
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(tenant.aadharBack, '_blank')}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">No image available</Typography>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>

        {/* Sidebar - Desktop only */}
        {!isMobile && (
          <Box width="250px">
            <Stack spacing={1}>
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
                      sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                    >
                      Payment History
                    </Button>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<ReportProblem />} 
                      onClick={() => setComplaintsOpen(true)}
                      sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                    >
                      Complaints
                    </Button>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<Edit />} 
                      onClick={() => setEditDialogOpen(true)}
                      sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                    >
                      Edit Tenant
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<ArrowBack />} 
                      onClick={() => navigate('/admin/tenants')}
                      sx={{ borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'grey.50' } }}
                    >
                      Back
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={2}>
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
                    <Typography variant="body1">{tenant.lastModifiedBy}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                      Last Modified Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(tenant.lastModifiedDate).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        )}
        
        {/* Mobile Action Buttons */}
        {isMobile && (
          <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
            <Stack spacing={1}>
              <Button 
                variant="contained" 
                startIcon={<History />} 
                onClick={() => setHistoryOpen(true)}
                size="small"
                sx={{ bgcolor: 'primary.main' }}
              >
                Payments
              </Button>
              <Button 
                variant="contained" 
                startIcon={<ReportProblem />} 
                onClick={() => setComplaintsOpen(true)}
                size="small"
                sx={{ bgcolor: 'warning.main' }}
              >
                Complaints
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Payment History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Payment History - {tenant.name}</Typography>
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
                  <TableCell>Date</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Transaction ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPayments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell>
                      <Chip label={payment.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status} 
                        color={payment.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{payment.txnId || '-'}</TableCell>
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
          <Button onClick={() => navigate(`/admin/payments?tenant=${tenant.id}`)}>
            View All Payments
          </Button>
          <Button onClick={() => setHistoryOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complaints History Dialog */}
      <Dialog open={complaintsOpen} onClose={() => setComplaintsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Complaints History - {tenant.name}</Typography>
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
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentComplaints.map((complaint) => (
                  <TableRow key={complaint.id} hover>
                    <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                    <TableCell>{complaint.title}</TableCell>
                    <TableCell>
                      <Chip label={complaint.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={complaint.priority} 
                        color={complaint.priority === 'high' ? 'error' : complaint.priority === 'medium' ? 'warning' : 'default'}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={complaint.status} 
                        color={complaint.status === 'resolved' ? 'success' : complaint.status === 'in-progress' ? 'warning' : 'default'}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {complaint.description}
                    </TableCell>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tenant Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Full Name"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editData.status}
                  label="Status"
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="notice">Notice Period</MenuItem>
                  <MenuItem value="vacated">Vacated</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Room Number"
                value={editData.room}
                onChange={(e) => setEditData({...editData, room: e.target.value})}
                fullWidth
              />
              <TextField
                label="Monthly Rent"
                type="number"
                value={editData.rent}
                onChange={(e) => setEditData({...editData, rent: parseInt(e.target.value)})}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setTenant({ ...editData, lastModifiedBy: 'Admin', lastModifiedDate: new Date().toISOString() });
              setEditDialogOpen(false);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantDetails;