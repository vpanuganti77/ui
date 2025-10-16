import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import StyledDataGrid from '../../components/common/StyledDataGrid';
import { AttachMoney, Receipt, Schedule } from '@mui/icons-material';

const MyPayments: React.FC = () => {
  const navigate = useNavigate();
  const paymentHistory = [
    {
      id: '1',
      amount: 8000,
      type: 'rent',
      month: '2024-03',
      paymentDate: '2024-03-05',
      status: 'paid',
      paymentMethod: 'online',
      transactionId: 'TXN123456',
      lastModifiedBy: 'Admin',
      lastModifiedDate: '2024-03-05T10:30:00Z'
    },
    {
      id: '2',
      amount: 8000,
      type: 'rent',
      month: '2024-02',
      paymentDate: '2024-02-03',
      status: 'paid',
      paymentMethod: 'cash',
      transactionId: null,
      lastModifiedBy: 'Manager',
      lastModifiedDate: '2024-02-03T14:20:00Z'
    },
    {
      id: '3',
      amount: 8000,
      type: 'rent',
      month: '2024-04',
      paymentDate: null,
      status: 'pending',
      paymentMethod: null,
      transactionId: null,
      lastModifiedBy: 'System',
      lastModifiedDate: '2024-04-01T09:00:00Z'
    }
  ];

  const handlePaymentClick = (id: string) => {
    navigate(`/customer/payments/${id}`);
  };

  const columns: GridColDef[] = [
    { 
      field: 'month', 
      headerName: 'Month', 
      flex: 1, 
      minWidth: 100,
      renderCell: (params) => (
        <Typography 
          sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => handlePaymentClick(params.row.id)}
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (params: any) => {
        if (!params) return '₹0';
        const value = params.value || params.row?.amount || 0;
        return `₹${value.toLocaleString()}`;
      },
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
    },
    { 
      field: 'paymentDate', 
      headerName: 'Date', 
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        if (!params || !params.value) return '-';
        return new Date(params.value).toLocaleDateString();
      }
    }
  ];

  const summary = {
    totalPaid: 16000,
    pendingAmount: 8000,
    nextDueDate: '2024-04-05',
    monthlyRent: 8000
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Payments
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <AttachMoney color="primary" />
                <Typography variant="body2" color="textSecondary">
                  Monthly Rent
                </Typography>
              </Box>
              <Typography variant="h5">
                ₹{summary.monthlyRent.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Receipt color="success" />
                <Typography variant="body2" color="textSecondary">
                  Total Paid
                </Typography>
              </Box>
              <Typography variant="h5" color="success.main">
                ₹{summary.totalPaid.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Schedule color="warning" />
                <Typography variant="body2" color="textSecondary">
                  Pending Amount
                </Typography>
              </Box>
              <Typography variant="h5" color="warning.main">
                ₹{summary.pendingAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Next Due Date
              </Typography>
              <Typography variant="h6">
                {new Date(summary.nextDueDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Payment History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment History
          </Typography>
          
          <Box sx={{ height: 450, width: '100%', '& .MuiDataGrid-root': { height: '100%' } }}>
            <StyledDataGrid rows={paymentHistory} columns={columns} checkboxSelection={false} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyPayments;