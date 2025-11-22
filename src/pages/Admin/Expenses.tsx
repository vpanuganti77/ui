import React from 'react';
import {
  Box,
  Typography,
  Chip
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

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'maintenance', label: '🔧 Maintenance' },
        { value: 'utilities', label: '💡 Utilities' },
        { value: 'supplies', label: '📦 Supplies' },
        { value: 'food', label: '🍽️ Food' },
        { value: 'other', label: '📋 Other' }
      ]
    }
  ];

  const sortOptions = [
    { key: 'date', label: '📅 Latest First', order: 'desc' as const },
    { key: 'date', label: '📅 Oldest First', order: 'asc' as const },
    { key: 'amount', label: '💰 Amount High to Low', order: 'desc' as const },
    { key: 'amount', label: '💰 Amount Low to High', order: 'asc' as const },
    { key: 'title', label: '📝 Title A-Z', order: 'asc' as const }
  ];

  const filterFields = {
    category: (item: any) => item.category
  };

  const sortFields = {
    date: (a: any, b: any) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
    amount: (a: any, b: any) => (a.amount || 0) - (b.amount || 0),
    title: (a: any, b: any) => (a.title || '').localeCompare(b.title || '')
  };

  return (
    <>
      <ListPage
        title="Expenses"
        data={[]}
        customDataLoader={async () => {
          const { getAll } = await import('../../services/fileDataService');
          return await getAll('expenses');
        }}
        enableMobileFilters={true}
        searchFields={['title', 'description']}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        filterFields={filterFields}
        sortFields={sortFields}
        entityKey="expenses"
        columns={columns}
        fields={expenseFields}
        entityName="Expense"
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
    </>
  );
};

export default Expenses;