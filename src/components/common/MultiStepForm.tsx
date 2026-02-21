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
} from '@mui/material';
import { Close, CameraAlt } from '@mui/icons-material';
import FormField from './FormField';
import { FieldConfig } from './FormField';

interface StepConfig {
  label: string;
  fields: string[];
  customRender?: (formData: any, errors: any, handleFieldChange: any, handleClearError: any) => React.ReactNode;
}

interface MultiStepFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
  title: string;
  fields: FieldConfig[];
  steps: StepConfig[];
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  open,
  onClose,
  onSubmit,
  editingItem,
  title,
  fields,
  steps
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initializeForm = async () => {
        const initialData: Record<string, any> = {};
        
        // Load options for all fields
        for (const field of fields) {
          if (field.loadOptions) {
            try {
              const options = await field.loadOptions(editingItem);
              field.options = options;
            } catch (error) {
              console.error(`Failed to load options for ${field.name}:`, error);
              field.options = [];
            }
          }
          
          initialData[field.name] = editingItem?.[field.name] || '';
        }
        
        setFormData(initialData);
        setErrors({});
        setActiveTab(0);
      };
      
      initializeForm();
    }
  }, [open, editingItem, fields]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClearError = (name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (stepIndex: number) => {
    const stepFields = steps[stepIndex].fields;
    const newErrors: Record<string, string> = {};

    stepFields.forEach(fieldName => {
      const field = fields.find(f => f.name === fieldName);
      if (!field) return;

      const value = formData[fieldName];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[fieldName] = `${field.label} is required`;
        return;
      }

      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on last step, validate current step and move to next
    if (activeTab < steps.length - 1) {
      if (validateStep(activeTab)) {
        setActiveTab(activeTab + 1);
      }
      return;
    }
    
    // On last step, validate all and submit
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false;
      }
    }
    
    if (allValid) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setActiveTab(0);
    onClose();
  };

  return (
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
            {editingItem ? `Edit ${title}` : `Add ${title}`}
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
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.95rem' },
              minHeight: { xs: 40, sm: 48 },
              minWidth: { xs: 'auto', sm: 160 },
              padding: { xs: '6px 8px', sm: '12px 16px' }
            }
          }}
        >
          {steps.map((step, index) => (
            <Tab key={index} label={step.label} />
          ))}
        </Tabs>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {steps[activeTab].customRender ? (
            steps[activeTab].customRender!(formData, errors, handleFieldChange, handleClearError)
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: { xs: 1.5, sm: 2 } 
            }}>
              {steps[activeTab].fields.map(fieldName => {
                const field = fields.find(f => f.name === fieldName);
                if (!field) return null;
                
                return (
                  <FormField
                    key={fieldName}
                    config={field}
                    value={formData[fieldName]}
                    onChange={handleFieldChange}
                    error={errors[fieldName]}
                    onClearError={handleClearError}
                  />
                );
              })}
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
            {activeTab > 0 && (
              <Button 
                onClick={() => setActiveTab(activeTab - 1)}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained"
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              {activeTab < steps.length - 1 ? 'Next' : (editingItem ? 'Update' : 'Add')}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MultiStepForm;
