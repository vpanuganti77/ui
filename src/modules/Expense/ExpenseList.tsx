import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { expenseFields } from '../../components/common/FormConfigs';
import ExpenseForm from './ExpenseForm';

const ExpenseList: React.FC = () => {
  const columns: GridColDef[] = [
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Category', width: 130 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (params: any) => `₹${(params || 0).toLocaleString()}`,
      align: 'right',
      headerAlign: 'right'
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      valueFormatter: (params: any) => new Date(params).toLocaleDateString()
    },
    { field: 'paymentMethod', headerName: 'Method', width: 120 }
  ];

  return (
    <ListPage
      title="Expenses"
      data={[]}
      customDataLoader={async () => {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        return await getAll('expenses');
      }}
      enableMobileFilters={true}
      searchFields={['description', 'category']}
      entityKey="expenses"
      columns={columns}
      fields={expenseFields}
      entityName="Expense"
      mobileCardConfig={{
        titleField: 'description',
        fields: [
          { key: 'category', label: 'Category', value: 'category' },
          { key: 'amount', label: 'Amount', value: 'amount', render: (value: number) => `₹${value.toLocaleString()}` },
          { key: 'date', label: 'Date', value: 'date', render: (value: string) => new Date(value).toLocaleDateString() },
          { key: 'paymentMethod', label: 'Method', value: 'paymentMethod' }
        ]
      }}
      CustomDialog={ExpenseForm}
    />
  );
};

export default ExpenseList;
