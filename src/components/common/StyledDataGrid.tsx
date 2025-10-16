import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef, DataGridProps, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import MobileCard from './MobileCard';

interface CardField {
  key: string;
  label: string;
  value: any;
  render?: (value: any, item?: any) => React.ReactNode;
  condition?: (item: any) => boolean;
}

interface MobileCardConfig {
  titleField: string;
  fields: CardField[];
}

interface StyledDataGridProps extends Omit<DataGridProps, 'rows' | 'columns'> {
  title?: string;
  columns: GridColDef[];
  rows?: any[];
  height?: number;
  apiService?: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  FormComponent?: React.ComponentType<{
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    editingItem: any;
    categories?: string[];
  }>;
  getRowId?: (row: any) => string;
  categories?: string[];
  headerCard?: React.ReactNode;
  onDataChange?: () => void;
  enableCrud?: boolean;
  mobileCardConfig?: MobileCardConfig;
  onItemClick?: (id: string) => void;
}

const StyledDataGrid: React.FC<StyledDataGridProps> = ({
  title,
  columns,
  rows: propRows,
  height = 450,
  apiService,
  FormComponent,
  getRowId = (row) => row._id || row.id,
  categories,
  headerCard,
  onDataChange,
  enableCrud = false,
  mobileCardConfig,
  onItemClick,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const data = propRows || [];
  console.log('StyledDataGrid received data:', data, 'propRows:', propRows);

  const handleAdd = () => {
    setEditingItem(null);
    setOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!apiService) return;
    if (window.confirm(`Are you sure you want to delete this ${title?.toLowerCase().slice(0, -1) || 'item'}?`)) {
      try {
        await apiService.delete(id);
        showSnackbar(`${title?.slice(0, -1) || 'Item'} deleted successfully`);
        onDataChange?.();
      } catch (error) {
        showSnackbar(`Failed to delete ${title?.toLowerCase().slice(0, -1) || 'item'}`, 'error');
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!apiService) return;
    try {
      if (editingItem) {
        await apiService.update(editingItem._id, formData);
        showSnackbar(`${title?.slice(0, -1) || 'Item'} updated successfully`);
      } else {
        await apiService.create(formData);
        showSnackbar(`${title?.slice(0, -1) || 'Item'} added successfully`);
      }
      setOpen(false);
      setEditingItem(null);
      onDataChange?.();
    } catch (error) {
      showSnackbar(`Failed to save ${title?.toLowerCase().slice(0, -1) || 'item'}`, 'error');
    }
  };

  // Add action columns if CRUD is enabled
  const columnsWithActions: GridColDef[] = enableCrud ? [
    ...columns,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<Delete sx={{ color: 'error.main' }} />}
          label="Delete"
          onClick={() => handleDelete(getRowId(params.row))}
        />,
      ],
    },
  ] : columns;

  // Mobile card view
  const mobileContent = mobileCardConfig && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      ) : (
        data.map((item) => (
          <MobileCard
            key={getRowId(item)}
            item={item}
            titleField={mobileCardConfig.titleField}
            fields={mobileCardConfig.fields}
            onEdit={enableCrud ? handleEdit : () => {}}
            onDelete={enableCrud ? handleDelete : () => {}}
            onItemClick={onItemClick}
            idField={getRowId(item) === item.id ? 'id' : '_id'}
          />
        ))
      )}
    </Box>
  );

  // Desktop table view
  const desktopContent = (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columnsWithActions}
        getRowId={(row) => row.id || row._id || Math.random().toString()}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        {...props}
        sx={{
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
            fontSize: '0.875rem',
            padding: '8px 16px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            minHeight: '52px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          '& .MuiDataGrid-columnHeaders': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important',
            color: 'white !important',
            borderBottom: 'none',
            fontWeight: '700 !important',
            fontSize: '0.9rem',
            minHeight: '56px !important',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: '700 !important',
              color: 'white !important',
            },
          },
          '& .MuiDataGrid-columnHeader': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important',
            color: 'white !important',
            '& .MuiCheckbox-root': {
              color: 'white !important',
              '&.Mui-checked': {
                color: 'white !important',
              },
            },
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(even)': {
              backgroundColor: '#f8fafc',
            },
            '&:hover': {
              backgroundColor: '#e3f2fd !important',
              cursor: 'pointer',
            },
          },
          '& .text-error': {
            color: '#d32f2f',
            fontWeight: 700,
            backgroundColor: '#ffebee',
            borderRadius: '6px',
            padding: '4px 8px',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #e0e0e0',
            backgroundColor: '#f8fafc',
          },
          '& .MuiDataGrid-sortIcon': {
            color: 'white !important',
          },
          '& .MuiDataGrid-menuIconButton': {
            color: 'white !important',
          },
        }}
      />
    </Box>
  );

  const content = isMobile && mobileCardConfig ? mobileContent : desktopContent;

  if (!enableCrud) {
    return <>{content}</>;
  }

  return (
    <Box>
      {title && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? "Add" : `Add ${title.slice(0, -1)}`}
          </Button>
        </Box>
      )}

      {headerCard && headerCard}

      <Card>
        <CardContent>
          {content}
        </CardContent>
      </Card>

      {FormComponent && (
        <FormComponent
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          editingItem={editingItem}
          categories={categories}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StyledDataGrid;