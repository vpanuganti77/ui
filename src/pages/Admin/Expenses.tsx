import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ListPage from '../../components/common/ListPage';
import { expenseFields } from '../../components/common/FormConfigs';
import { getCategoryColor } from '../../components/common/MobileCardConfigs';

const Expenses: React.FC = () => {

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2">{params.value}</Typography>
          {params.row?.description && (
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getCategoryColor(params.value) as any}
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="subtitle2" color="error.main">
          ₹{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (params: any) => new Date(params).toLocaleDateString(),
    },
    {
      field: 'addedBy',
      headerName: 'Added By',
      width: 150,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {params.row?.addedBy?.name || 'N/A'}
        </Typography>
      ),
    },
  ];

  const customSubmitLogic = (formData: any, editingItem: any) => {
    if (editingItem) {
      return { ...editingItem, ...formData, amount: parseFloat(formData.amount) };
    } else {
      return {
        title: formData.title,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description || ''
      };
    }
  };

  return (
    <ListPage
      title="Expenses"
      data={[]}
      columns={columns}
      fields={expenseFields}
      entityName="Expense"
      entityKey="expenses"
      mobileCardConfig={{
        titleField: 'title',
        fields: [
          { key: 'category', label: 'Category', value: 'category' },
          { key: 'amount', label: 'Amount', value: 'amount', render: (value: number) => `₹${value.toLocaleString()}` },
          { key: 'date', label: 'Date', value: 'date', render: (value: string) => new Date(value).toLocaleDateString() }
        ]
      }}
      customSubmitLogic={customSubmitLogic}
    />
  );
};

export default Expenses;