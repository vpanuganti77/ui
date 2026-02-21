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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'error' as 'error' 
  });

  // Initialize form data
  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.name] = editingItem?.[field.name] || '';
      });
      setFormData(initialData);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
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

  // Group fields into rows (2 fields per row by default)
  const groupedFields = [];
  for (let i = 0; i < fields.length; i += 2) {
    groupedFields.push(fields.slice(i, i + 2));
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth={maxWidth} 
        fullWidth
        fullScreen={window.innerWidth < 600}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: '100%' },
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: '90vh' },
            borderRadius: { xs: 0, sm: 2 },
            display: 'flex',
            flexDirection: 'column'
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
            overflow: 'auto', 
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5,
              flex: { xs: '1 1 auto', sm: 'none' },
              justifyContent: { xs: 'flex-start', sm: 'flex-start' }
            }}>
              {groupedFields.map((row, rowIndex) => (
                <Box 
                  key={rowIndex} 
                  sx={{ 
                    display: 'flex', 
                    gap: 1.5, 
                    flexWrap: 'wrap',
                    ...(row.length === 1 && { '& > *': { flex: '1 1 100%' } })
                  }}
                >
                  {row.map((field) => (
                    <FormField
                      key={field.name}
                      config={field}
                      value={formData[field.name]}
                      onChange={handleFieldChange}
                      error={errors[field.name]}
                      onClearError={handleClearError}
                    />
                  ))}
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
            <Button type="submit" variant="contained">
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
