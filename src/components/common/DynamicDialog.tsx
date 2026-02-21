import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Snackbar,
  Alert,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import FormField, { FieldConfig } from './FormField';

interface DynamicDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FieldConfig[];
  editingItem?: any;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  submitLabel?: string;
  cancelLabel?: string;
}

const DynamicDialog: React.FC<DynamicDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  editingItem,
  maxWidth = 'sm',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'error' as 'error' 
  });

  // Initialize form data
  useEffect(() => {
    if (open) {
      const initialFormData: Record<string, any> = {};
      fields.forEach(field => {
        initialFormData[field.name] = editingItem?.[field.name] || '';
      });
      setFormData(initialFormData);
      setInitialData(initialFormData);
      setErrors({});
    }
  }, [open, editingItem, fields]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-populate rent when room is selected
      if (name === 'roomId') {
        const roomField = fields.find(f => f.name === 'roomId');
        const selectedRoom = roomField?.options?.find(opt => opt.value === value);
        if (selectedRoom?.rent) {
          newData.rent = selectedRoom.rent;
        }
      }
      
      return newData;
    });
  };

  const handleClearError = (name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Check if form has changes
  const hasChanges = editingItem ? 
    Object.keys(formData).some(key => formData[key] !== initialData[key]) : 
    true;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()) || (field.type === 'camera' && !value))) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }

      // Built-in validations
      if (value && typeof value === 'string') {
        switch (field.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              newErrors[field.name] = 'Please enter a valid email address';
            }
            break;
          case 'number':
            if (isNaN(Number(value)) || Number(value) <= 0) {
              newErrors[field.name] = `${field.label} must be a valid positive number`;
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors',
        severity: 'error'
      });
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth={false}
        fullScreen={window.innerWidth < 600}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 0, sm: 2 },
            width: { 
              xs: '100%', 
              sm: maxWidth === 'xs' ? '280px' : 
                  maxWidth === 'md' ? '800px' : '600px'
            },
            height: { xs: '100%', sm: 'fit-content' },
            maxHeight: 'none',
            borderRadius: { xs: 0, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            overflow: { xs: 'hidden', sm: 'visible' }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0', 
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          flexShrink: 0 
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{title}</Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ 
            flex: 1, 
            overflow: 'visible', 
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
          }}>
            <Box sx={{ 
              display: maxWidth === 'xs' ? 'flex' : 'grid',
              flexDirection: maxWidth === 'xs' ? 'column' : undefined,
              gridTemplateColumns: { xs: '1fr', sm: maxWidth === 'xs' ? '1fr' : '1fr 1fr' },
              gap: { xs: 1.5, sm: maxWidth === 'xs' ? 1.5 : 2 },
              alignItems: 'start'
            }}>
              {fields.map((field) => (
                <Box 
                  key={field.name}
                  sx={{
                    gridColumn: field.flex === '1 1 100%' ? { xs: '1', sm: '1 / -1' } : 'auto'
                  }}
                >
                  <FormField
                    config={field}
                    value={formData[field.name]}
                    onChange={handleFieldChange}
                    error={errors[field.name]}
                    onClearError={handleClearError}
                  />
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e0e0e0', 
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 1.5 },
            flexShrink: 0,
            gap: 1,
            position: { xs: 'sticky', sm: 'static' },
            bottom: { xs: 0, sm: 'auto' },
            bgcolor: 'background.paper',
            zIndex: 1,
            '& .MuiButton-root': {
              flex: { xs: 1, sm: 'none' }
            }
          }}>
            <Button onClick={handleClose}>{cancelLabel}</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!hasChanges}
            >
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
    </>
  );
};

export default DynamicDialog;
