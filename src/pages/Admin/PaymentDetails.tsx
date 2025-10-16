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
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
} from '@mui/material';
import { ArrowBack, Edit, Payment, Person, Save, Cancel, Receipt } from '@mui/icons-material';

const PaymentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [payment, setPayment] = useState({
    id: '1',
    tenantName: 'John Doe',
    tenantId: 'T001',
    amount: 8000,
    type: 'rent',
    month: '2024-03',
    paymentDate: '2024-03-05',
    status: 'paid',
    paymentMethod: 'online',
    transactionId: 'TXN123456',
    notes: 'Monthly rent payment',
    lastModifiedBy: 'Admin',
    lastModifiedDate: '2024-03-05T10:30:00Z'
  });
  const [editData, setEditData] = useState({ ...payment });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const handleSave = () => {
    setPayment({ ...editData, lastModifiedBy: 'Admin', lastModifiedDate: new Date().toISOString() });
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditData({ ...payment });
    setEditMode(false);
  };

  const InfoField = ({ label, value, field, type = 'text' }: any) => (
    <Box sx={{ mb: 0.3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      {editMode ? (
        field === 'status' ? (
          <FormControl size="small" fullWidth>
            <Select
              value={editData[field as keyof typeof editData]}
              onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        ) : field === 'paymentMethod' ? (
          <FormControl size="small" fullWidth>
            <Select
              value={editData[field as keyof typeof editData]}
              onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>
        ) : field === 'type' ? (
          <FormControl size="small" fullWidth>
            <Select
              value={editData[field as keyof typeof editData]}
              onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            >
              <MenuItem value="rent">Rent</MenuItem>
              <MenuItem value="deposit">Deposit</MenuItem>
              <MenuItem value="electricity">Electricity</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <TextField
            size="small"
            fullWidth
            type={type}
            multiline={field === 'notes'}
            rows={field === 'notes' ? 3 : 1}
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
        <Typography variant="body1" sx={{ fontWeight: 400 }}>
          {field === 'amount' 
            ? `₹${parseInt(value).toLocaleString()}` 
            : field === 'paymentDate' 
            ? new Date(value).toLocaleDateString()
            : value}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 0.5, maxWidth: '100%', mx: 'auto', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 1, mb: 0.5, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton size="small" onClick={() => navigate('/admin/payments')} sx={{ bgcolor: 'white' }}>
              <ArrowBack fontSize="small" />
            </IconButton>
            <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
              <Payment />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Payment #{payment.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {payment.tenantName} • {payment.month} • ₹{payment.amount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            {editMode ? (
              <>
                <Button size="small" startIcon={<Cancel />} onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" startIcon={<Save />} onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <Button size="small" variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)}>
                Edit
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Content */}
      <Box display="flex" gap={1} flexWrap="wrap" height="calc(100vh - 70px)">
        {/* Main Content */}
        <Box flex="1" minWidth="600px" sx={{ overflow: 'auto' }}>
          <Stack spacing={0.5}>
            {/* Payment Information */}
            <Card elevation={2}>
              <CardHeader 
                avatar={<Receipt color="primary" />}
                title="Payment Details"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
                  <InfoField label="Amount" value={payment.amount} field="amount" type="number" />
                  <InfoField label="Payment Type" value={payment.type} field="type" />
                  <InfoField label="Month" value={payment.month} field="month" type="month" />
                  <InfoField label="Payment Date" value={payment.paymentDate} field="paymentDate" type="date" />
                  <InfoField label="Payment Method" value={payment.paymentMethod} field="paymentMethod" />
                  <InfoField label="Status" value={payment.status} field="status" />
                  <InfoField label="Transaction ID" value={payment.transactionId} field="transactionId" />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <InfoField label="Notes" value={payment.notes} field="notes" />
                </Box>
              </CardContent>
            </Card>

            {/* Tenant Information */}
            <Card elevation={2}>
              <CardHeader 
                avatar={<Person color="primary" />}
                title="Tenant Information"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
                  <InfoField label="Tenant Name" value={payment.tenantName} field="tenantName" />
                  <InfoField label="Tenant ID" value={payment.tenantId} field="tenantId" />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Sidebar */}
        <Box width="250px" sx={{ overflow: 'auto' }}>
          <Stack spacing={0.5}>
            {/* Quick Actions */}
            <Card elevation={2}>
              <CardHeader 
                title="Quick Actions"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Person />} onClick={() => navigate(`/admin/tenants/${payment.tenantId}`)}>
                    View Tenant
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<Receipt />} onClick={() => window.print()}>
                    Generate Receipt
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Audit Information */}
            <Card elevation={2}>
              <CardHeader 
                title="Audit Trail"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Last Modified By
                  </Typography>
                  <Typography variant="body1">{payment.lastModifiedBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Last Modified Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(payment.lastModifiedDate).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentDetails;