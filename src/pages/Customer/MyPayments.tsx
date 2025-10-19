import React, { useState, useEffect } from 'react';
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
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalPaid: 0, pendingAmount: 0, nextDueDate: null, monthlyRent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentData = async () => {
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
          // Get payments for this tenant
          const payments = await getAll('payments');
          const tenantPayments = payments.filter((p: any) => p.tenantId === tenant.id);
          
          setPaymentHistory(tenantPayments);
          
          // Calculate summary
          const totalPaid = tenantPayments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          const pendingAmount = tenantPayments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          
          setSummary({
            totalPaid,
            pendingAmount,
            nextDueDate: tenant.nextDueDate,
            monthlyRent: Number(tenant.rent || 0)
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading payment data:', error);
        setLoading(false);
      }
    };
    
    loadPaymentData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography>Loading...</Typography></Box>;
  }

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
                {summary.nextDueDate ? new Date(summary.nextDueDate).toLocaleDateString() : 'N/A'}
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