import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, Typography, Button } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Receipt } from '@mui/icons-material';
import ListPage from '../../components/common/ListPage';
import { paymentFields } from '../../components/common/FormConfigs';
import { paymentCardFields } from '../../components/common/MobileCardConfigs';

const initialPayments = [
  {
    id: '1',
    tenantName: 'John Doe',
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
    tenantName: 'Jane Smith',
    amount: 6000,
    type: 'rent',
    month: '2024-03',
    paymentDate: null,
    status: 'pending',
    paymentMethod: null,
    transactionId: null,
    lastModifiedBy: 'Manager',
    lastModifiedDate: '2024-03-10T14:20:00Z'
  }
];

const Payments: React.FC = () => {
  const navigate = useNavigate();

  const handleItemClick = (id: string) => {
    navigate(`/admin/payments/${id}`);
  };

  const customSubmitLogic = (formData: any, editingItem: any) => {
    if (editingItem) {
      return {
        ...editingItem,
        ...formData,
        amount: parseFloat(formData.amount)
      };
    } else {
      return {
        id: (Math.random() * 1000).toString(),
        tenantName: 'Tenant Name',
        amount: parseFloat(formData.amount),
        type: formData.type,
        month: formData.month,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || 'N/A',
        lastModifiedBy: 'Admin',
        lastModifiedDate: new Date().toISOString()
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const generateBills = () => {
    alert('Monthly bills generated successfully');
  };

  const columns: GridColDef[] = [
    { 
      field: 'tenantName', 
      headerName: 'Tenant', 
      flex: 1, 
      minWidth: 150
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
    { field: 'month', headerName: 'Month', width: 100 },
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

  const additionalActions = (
    <Button variant="outlined" startIcon={<Receipt />} onClick={generateBills} size="medium">
      Generate Bills
    </Button>
  );

  return (
    <ListPage
      title="Payments"
      data={[]}
      columns={columns}
      fields={paymentFields}
      entityName="Payment"
      entityKey="payments"
      onItemClick={handleItemClick}
      mobileCardConfig={{
        titleField: 'tenantId',
        fields: [
          { key: 'amount', label: 'Amount', value: 'amount', render: (value: number) => `₹${value.toLocaleString()}` },
          { key: 'month', label: 'Month', value: 'month' },
          { key: 'year', label: 'Year', value: 'year' },
          { key: 'status', label: 'Status', value: 'status' },
          { key: 'createdAt', label: 'Date', value: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString() }
        ]
      }}
      customSubmitLogic={customSubmitLogic}
      additionalActions={additionalActions}
    />
  );
};

export default Payments;