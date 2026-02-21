import React from 'react';
import { Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { paymentFields } from '../../components/common/FormConfigs';
import PaymentForm from './PaymentForm';

const PaymentList: React.FC = () => {
  const columns: GridColDef[] = [
    { field: 'tenantId', headerName: 'Tenant', flex: 1, minWidth: 150 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (params: any) => `₹${(params || 0).toLocaleString()}`,
      align: 'right',
      headerAlign: 'right'
    },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'month', headerName: 'Month', width: 100 },
    { field: 'paymentMethod', headerName: 'Method', width: 120 }
  ];

  return (
    <ListPage
      title="Payments"
      data={[]}
      customDataLoader={async () => {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        return await getAll('payments');
      }}
      enableMobileFilters={true}
      searchFields={['tenantId', 'transactionId']}
      entityKey="payments"
      columns={columns}
      fields={paymentFields}
      entityName="Payment"
      mobileCardConfig={{
        titleField: 'tenantId',
        fields: [
          { key: 'amount', label: 'Amount', value: 'amount', render: (value: number) => `₹${value.toLocaleString()}` },
          { key: 'type', label: 'Type', value: 'type' },
          { key: 'month', label: 'Month', value: 'month' },
          { key: 'paymentMethod', label: 'Method', value: 'paymentMethod' }
        ]
      }}
      CustomDialog={PaymentForm}
    />
  );
};

export default PaymentList;
