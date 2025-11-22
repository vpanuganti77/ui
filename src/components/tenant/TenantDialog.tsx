import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { Close, CameraAlt } from '@mui/icons-material';
import FormField from '../common/FormField';
import { tenantFields } from '../common/FormConfigs';

interface TenantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const TenantDialog: React.FC<TenantDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'error' as 'error' 
  });

  // Separate fields
  const basicFields = tenantFields.filter(field => 
    !['aadharNumber', 'aadharFront', 'aadharBack'].includes(field.name)
  );
  const aadharFields = tenantFields.filter(field => 
    ['aadharNumber', 'aadharFront', 'aadharBack'].includes(field.name)
  );

  useEffect(() => {
    if (open) {
      const initializeForm = async () => {
        const initialData: Record<string, any> = {};
        
        // Load room options first
        const roomField = tenantFields.find(f => f.name === 'roomId');
        if (roomField && roomField.loadOptions) {
          try {
            const options = await roomField.loadOptions(editingItem);
            roomField.options = options;
            if (options.length === 0) {
              console.warn('No available rooms found for tenant assignment');
            }
          } catch (error) {
            console.error('Failed to load room options:', error);
            roomField.options = [];
          }
        }
        
        // Initialize form data
        for (const field of tenantFields) {
          // Map room field to roomId for form compatibility
          if (field.name === 'roomId') {
            initialData[field.name] = editingItem?.room || editingItem?.roomId || '';
          } else {
            initialData[field.name] = editingItem?.[field.name] || '';
          }
        }
        
        setFormData(initialData);
        setErrors({});
        setActiveTab(0);
      };
      
      initializeForm();
    }
  }, [open, editingItem]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-populate rent when room is selected
      if (name === 'roomId') {
        const roomField = tenantFields.find(f => f.name === 'roomId');
        const selectedRoom = roomField?.options?.find(opt => opt.value === value);
        if (selectedRoom?.rent) {
          newData.rent = selectedRoom.rent;
        }
      }
      
      return newData;
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClearError = (name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateField = (name: string, value: any) => {
    const field = tenantFields.find(f => f.name === name);
    if (!field) return '';

    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} is required`;
    }

    if (field.validation && value) {
      const error = field.validation(value);
      if (error) return error;
    }

    if (value && typeof value === 'string') {
      switch (field.type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
          }
          break;
        case 'number':
          if (isNaN(Number(value)) || Number(value) <= 0) {
            return `${field.label} must be a valid positive number`;
          }
          break;
      }
    }

    return '';
  };

  const handleAadharPhoto = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const fieldName = type === 'front' ? 'aadharFront' : 'aadharBack';
          setFormData(prev => ({ ...prev, [fieldName]: result }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    tenantFields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }

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

    // Custom validation for Aadhar photos
    if (!formData.aadharFront) {
      newErrors.aadharFront = 'Aadhar front photo is required';
    }
    if (!formData.aadharBack) {
      newErrors.aadharBack = 'Aadhar back photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBasicFields = () => {
    const newErrors: Record<string, string> = {};

    basicFields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        if (field.name === 'roomId') {
          const roomField = tenantFields.find(f => f.name === 'roomId');
          if (!roomField?.options || roomField.options.length === 0) {
            newErrors[field.name] = 'No available rooms found. Please create rooms first in the Rooms section.';
          } else {
            newErrors[field.name] = `${field.label} is required`;
          }
        } else {
          newErrors[field.name] = `${field.label} is required`;
        }
        return;
      }

      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }

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

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If on first tab, validate basic fields and move to next tab
    if (activeTab === 0) {
      if (!validateBasicFields()) {
        const roomField = tenantFields.find(f => f.name === 'roomId');
        const hasNoRooms = !roomField?.options || roomField.options.length === 0;
        
        setSnackbar({
          open: true,
          message: hasNoRooms 
            ? 'No available rooms found. Please create rooms first in the Rooms section.' 
            : 'Please fix the validation errors',
          severity: 'error'
        });
        return;
      }
      setActiveTab(1);
      return;
    }
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors',
        severity: 'error'
      });
      return;
    }

    // Map roomId back to room for database compatibility
    const submitData: any = {
      ...formData,
      room: formData.roomId || formData.room,
      roomId: formData.roomId,
    };
    
    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setActiveTab(0);
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
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
          },
          '& .MuiDialogContent-root': {
            flex: 1,
            overflow: 'auto',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 }
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {editingItem ? 'Edit Tenant' : 'Add Tenant'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem'
              }
            }}
          >
            <Tab label="Step 1: Basic Details" />
            <Tab label="Step 2: Aadhar Documents" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            {activeTab === 0 && (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: { xs: 1.5, sm: 2 } 
              }}>
                {basicFields.map((field) => (
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
            )}
            
            {activeTab === 1 && (
              <Box>
                {/* Aadhar Number - Full Width */}
                <Box sx={{ mb: 3 }}>
                  <FormField
                    config={{
                      ...aadharFields.find(f => f.name === 'aadharNumber')!,
                      width: '100%'
                    }}
                    value={formData['aadharNumber']}
                    onChange={handleFieldChange}
                    error={errors['aadharNumber']}
                    onClearError={handleClearError}
                  />
                </Box>
                
                {/* Photo Frames - Responsive Layout */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                  gap: { xs: 2, sm: 3 } 
                }}>
                  {/* Aadhar Front Frame */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Aadhar Front
                    </Typography>
                    <Box 
                      sx={{
                        width: '100%',
                        height: { xs: '160px', sm: '180px' },
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: formData['aadharFront'] ? 'transparent' : '#f9f9f9',
                        '&:hover': { borderColor: 'primary.main' },
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => handleAadharPhoto('front')}
                    >
                      {formData['aadharFront'] ? (
                        <img 
                          src={formData['aadharFront']} 
                          alt="Aadhar Front" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <>
                          <CameraAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Capture Aadhar Front
                          </Typography>
                        </>
                      )}
                    </Box>
                    {errors.aadharFront && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.aadharFront}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Aadhar Back Frame */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Aadhar Back
                    </Typography>
                    <Box 
                      sx={{
                        width: '100%',
                        height: { xs: '160px', sm: '180px' },
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: formData['aadharBack'] ? 'transparent' : '#f9f9f9',
                        '&:hover': { borderColor: 'primary.main' },
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => handleAadharPhoto('back')}
                    >
                      {formData['aadharBack'] ? (
                        <img 
                          src={formData['aadharBack']} 
                          alt="Aadhar Back" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <>
                          <CameraAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Capture Aadhar Back
                          </Typography>
                        </>
                      )}
                    </Box>
                    {errors.aadharBack && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.aadharBack}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            borderTop: '1px solid #e0e0e0', 
            pt: 2,
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 2 },
            flexDirection: 'row',
            gap: { xs: 1, sm: 0 },
            position: { xs: 'sticky', sm: 'static' },
            bottom: { xs: 0, sm: 'auto' },
            bgcolor: 'background.paper',
            zIndex: 1
          }}>
            {activeTab === 0 ? (
              <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                <Button 
                  onClick={handleClose}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Next
                </Button>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Button 
                  onClick={handleClose}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setActiveTab(0)}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  {editingItem ? 'Update' : 'Add'}
                </Button>
              </Box>
            )}
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

export default TenantDialog;