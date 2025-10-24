import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Fab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
} from '@mui/material';
import { Inbox } from '@mui/icons-material';
import { GridColDef, GridActionsCellItem, GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import StyledDataGrid from './StyledDataGrid';
import DynamicDialog from './DynamicDialog';
import MobileCard from './MobileCard';
import { FieldConfig } from './FormField';
import { useListManager } from '../../hooks/useListManager';

interface CardField {
  key: string;
  label: string;
  value: any;
  render?: (value: any, item?: any) => React.ReactNode;
  condition?: (item: any) => boolean;
}

interface ListPageProps<T> {
  title: string;
  data: T[];
  columns: GridColDef[];
  fields: FieldConfig[];
  entityName: string;
  entityKey?: string;
  idField?: string;
  rowHeight?: number;
  onItemClick?: (id: string) => void;
  renderMobileCard?: (item: T, onEdit: (id: string) => void, onDelete: (id: string) => void) => React.ReactNode;
  mobileCardConfig?: {
    titleField: string;
    fields: CardField[];
  };
  customSubmitLogic?: (formData: any, editingItem: T | null) => T;
  additionalValidation?: (formData: any) => string | null;
  additionalActions?: React.ReactNode;
  hideDelete?: boolean;
  hideEdit?: boolean;
  hideActions?: boolean;
  hideAdd?: boolean;
  conditionalEdit?: (item: T) => boolean;
  onAfterCreate?: (newItem: T) => void;
  CustomDialog?: React.ComponentType<{
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    editingItem?: T | null;
  }>;
}

const ListPage = <T extends Record<string, any>>({
  title,
  data: initialData,
  columns,
  fields,
  entityName,
  entityKey = 'default',
  idField = 'id',
  rowHeight = 52,
  onItemClick,
  renderMobileCard,
  mobileCardConfig,
  customSubmitLogic,
  additionalValidation,
  additionalActions,
  hideDelete = false,
  hideEdit = false,
  hideActions = false,
  hideAdd = false,
  conditionalEdit,
  onAfterCreate,
  CustomDialog
}: ListPageProps<T>) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    data,
    open,
    deleteOpen,
    editingItem,
    snackbar,
    showSnackbar,
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleSubmit: baseHandleSubmit,
    closeDialog,
    closeDeleteDialog,
    closeSnackbar
  } = useListManager({
    initialData,
    entityName,
    entityKey,
    idField
  });

  const handleSubmit = (formData: any) => {
    // Get current user's hostel for scoped validation
    const userData = localStorage.getItem('user');
    let currentHostelId: string | null = null;
    let currentUser: any = null;
    if (userData) {
      try {
        currentUser = JSON.parse(userData);
        currentHostelId = currentUser.hostelId;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Check unique constraints within hostel scope
    const uniqueFields = ['email', 'phone', 'name', 'roomNumber', 'aadharNumber'];
    for (const field of uniqueFields) {
      if (formData[field]) {
        const existing = data.find(item => {
          // For global entities (users, hostels), check globally
          if (['users', 'hostels'].includes(entityKey)) {
            return item[field]?.toLowerCase() === formData[field]?.toLowerCase() && 
                   item[idField] !== editingItem?.[idField];
          }
          // For hostel-scoped entities, check within same hostel
          return item[field]?.toLowerCase() === formData[field]?.toLowerCase() && 
                 item[idField] !== editingItem?.[idField] &&
                 item.hostelId === currentHostelId;
        });
        if (existing) {
          const scope = ['users', 'hostels'].includes(entityKey) ? '' : ' in this hostel';
          showSnackbar(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists${scope}`, 'error');
          return;
        }
      }
    }
    
    // Run additional validation if provided
    if (additionalValidation) {
      const validationError = additionalValidation(formData);
      if (validationError) {
        showSnackbar(validationError, 'error');
        return;
      }
    }

    baseHandleSubmit(formData, customSubmitLogic, onAfterCreate);
  };

  const shouldHideAddButton = () => {
    // Only tenants can add complaints
    if (entityKey === 'complaints') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.role !== 'tenant';
        } catch (error) {
          return true;
        }
      }
      return true;
    }
    return false;
  };

  // Add action columns to grid columns
  const columnsWithActions: GridColDef[] = [
    ...columns.map(col => {
      // Add click handler to first column if onItemClick provided
      if (col.field === columns[0].field && onItemClick) {
        return {
          ...col,
          renderCell: (params: GridRenderCellParams) => (
            <Typography 
              sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => onItemClick(params.row[idField])}
            >
              {params.value}
            </Typography>
          )
        };
      }
      return col;
    }),
    ...(hideActions ? [] : [{
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Actions',
      width: 120,
      getActions: (params: any) => [
        ...((hideEdit || (conditionalEdit && !conditionalEdit(params.row))) ? [] : [
          <GridActionsCellItem
            key="edit"
            icon={<Edit color="primary" />}
            label="Edit"
            onClick={() => handleEdit(params.id)}
          />
        ]),
        ...(hideDelete ? [] : [
          <GridActionsCellItem
            key="delete"
            icon={<Delete color="error" />}
            label="Delete"
            onClick={() => handleDelete(params.id)}
          />
        ])
      ]
    } as GridColDef])
  ];

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {title}
        </Typography>
        {!isMobile && (
          <Box display="flex" gap={1}>
            {additionalActions}
            {!hideAdd && !shouldHideAddButton() && (
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd} size="medium">
                Add {entityName}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {isMobile ? (
        <Box>
          {data.length === 0 ? (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: 'grey.50',
                border: '1px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Inbox sx={{ fontSize: 48, color: 'grey.400' }} />
                <Typography variant="h6" color="text.secondary">
                  No {title.toLowerCase()} found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {!hideAdd && !shouldHideAddButton() ? 
                    `Get started by adding your first ${entityName.toLowerCase()}` :
                    `No ${entityName.toLowerCase()} records available`
                  }
                </Typography>
                {!hideAdd && !shouldHideAddButton() && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={handleAdd}
                    sx={{ mt: 2 }}
                  >
                    Add {entityName}
                  </Button>
                )}
              </Stack>
            </Paper>
          ) : (
            renderMobileCard ? (
              data.map(item => renderMobileCard(item, handleEdit, handleDelete))
            ) : mobileCardConfig ? (
              data.map(item => (
                <MobileCard
                  key={item[idField]}
                  item={item}
                  titleField={mobileCardConfig.titleField}
                  fields={mobileCardConfig.fields}
                  onEdit={conditionalEdit && !conditionalEdit(item) ? () => {} : handleEdit}
                  onDelete={handleDelete}
                  onItemClick={onItemClick}
                  idField={idField}
                  hideDelete={hideDelete}
                  hideEdit={hideEdit || (conditionalEdit && !conditionalEdit(item))}
                />
              ))
            ) : (
              <Typography>Mobile view not configured</Typography>
            )
          )}
        </Box>
      ) : (
        <>
          {console.log('ListPage passing data to StyledDataGrid:', data, 'idField:', idField)}
          <StyledDataGrid 
            rows={data} 
            columns={columnsWithActions}
            getRowId={(row) => {
              console.log('getRowId called with row:', row, 'idField:', idField, 'result:', row[idField]);
              return row[idField] || row.id || row._id || Math.random().toString();
            }}
            rowHeight={rowHeight}
            disableRowSelectionOnClick
            checkboxSelection={false}
            slots={{
              noRowsOverlay: () => (
                <Stack height="100%" alignItems="center" justifyContent="center" spacing={2}>
                  <Inbox sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="h6" color="text.secondary">
                    No {title.toLowerCase()} found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {!hideAdd && !shouldHideAddButton() ? 
                      `Get started by adding your first ${entityName.toLowerCase()}` :
                      `No ${entityName.toLowerCase()} records available`
                    }
                  </Typography>
                  {!hideAdd && !shouldHideAddButton() && (
                    <Button 
                      variant="contained" 
                      startIcon={<Add />} 
                      onClick={handleAdd}
                      sx={{ mt: 1 }}
                    >
                      Add {entityName}
                    </Button>
                  )}
                </Stack>
              )
            }}
          />
        </>
      )}

      {CustomDialog ? (
        <CustomDialog
          open={open}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          editingItem={editingItem}
        />
      ) : (
        <DynamicDialog
          open={open}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          title={editingItem ? `Edit ${entityName}` : `Add New ${entityName}`}
          fields={fields}
          editingItem={editingItem}
          submitLabel={entityName}
          maxWidth="sm"
        />
      )}

      <Dialog open={deleteOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {entityName.toLowerCase()}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {isMobile && !hideAdd && !shouldHideAddButton() && data.length > 0 && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
          onClick={handleAdd}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default ListPage;