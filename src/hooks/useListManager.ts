import { useState, useEffect } from 'react';
import { getAll, create, update, remove } from '../shared/services/storage/fileDataService';

interface UseListManagerProps<T> {
  initialData?: T[];
  entityName: string;
  entityKey: string; // Key for API service (e.g., 'hostels', 'tenants')
  idField?: string;
}

export const useListManager = <T extends Record<string, any>>({
  initialData = [],
  entityName,
  entityKey,
  idField = 'id'
}: UseListManagerProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);

  // Update data when initialData changes (for filtered/sorted data)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    let mounted = true;
    
    // Only load from service if no initialData provided
    if (initialData.length === 0) {
      const loadData = async () => {
        try {
          console.log(`Loading data for ${entityKey}...`);
          const storedData = await getAll(entityKey as any);
          console.log(`Loaded ${storedData?.length || 0} items for ${entityKey}:`, storedData);
          if (mounted) {
            setData(Array.isArray(storedData) ? storedData : []);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
          if (mounted) {
            setData([]);
          }
        }
      };
      
      loadData();
    }
    
    // Listen for data refresh events
    const handleRefreshData = () => {
      if (mounted && initialData.length === 0) {
        const loadData = async () => {
          try {
            const storedData = await getAll(entityKey as any);
            if (mounted) {
              setData(Array.isArray(storedData) ? storedData : []);
            }
          } catch (error) {
            console.error('Failed to load data:', error);
          }
        };
        loadData();
      }
    };
    
    const handleDashboardRefresh = () => {
      if (mounted && initialData.length === 0) {
        handleRefreshData();
      }
    };
    
    window.addEventListener('refreshData', handleRefreshData);
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => { 
      mounted = false;
      window.removeEventListener('refreshData', handleRefreshData);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [entityKey, initialData.length]);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const item = data.find(item => item[idField] === id);
    if (item) {
      setEditingItem(item);
      setOpen(true);
    }
  };

  const handleDelete = (id: string | number) => {
    setDeleteId(id.toString());
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        // Prevent deletion of complaints
        if (entityKey === 'complaints') {
          showSnackbar('Complaints cannot be deleted once raised', 'error');
          setDeleteOpen(false);
          setDeleteId(null);
          return;
        }
        
        await remove(entityKey as any, deleteId);
        setData(data.filter(item => item[idField] !== deleteId));
        showSnackbar(`${entityName} deleted successfully`);
      } catch (error: any) {
        // Show specific error message from backend
        const errorMessage = error.message || `Failed to delete ${entityName.toLowerCase()}`;
        showSnackbar(errorMessage, 'error');
      }
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleSubmit = async (formData: any, customLogic?: (formData: any, editingItem: T | null) => T, onAfterCreate?: (newItem: T) => void) => {
    try {
      if (editingItem) {
        const updatedItem = customLogic ? customLogic(formData, editingItem) : { ...editingItem, ...formData };
        const result = await update(entityKey as any, editingItem[idField], updatedItem);
        if (result) {
          setData(data.map(item => item[idField] === editingItem[idField] ? result : item));
          showSnackbar(`${entityName} updated successfully`);
          setOpen(false);
          setEditingItem(null);
        }
      } else {
        const newItemData = customLogic ? customLogic(formData, null) : formData;
        const newItem = await create(entityKey as any, newItemData);
        setData([...data, newItem]);
        showSnackbar(`${entityName} added successfully`);
        if (onAfterCreate) {
          onAfterCreate(newItem);
        }
        setOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      showSnackbar(`Failed to save ${entityName.toLowerCase()}`, 'error');
      // Don't close dialog on error - keep it open so user can fix issues
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return {
    data,
    setData,
    open,
    deleteOpen,
    editingItem,
    snackbar,
    showSnackbar,
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleSubmit,
    closeDialog,
    closeDeleteDialog,
    closeSnackbar
  };
};
