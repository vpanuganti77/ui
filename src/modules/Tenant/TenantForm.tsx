import React from 'react';
import { Box, Typography } from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import MultiStepForm from '../../components/common/MultiStepForm';
import { tenantFields } from '../../components/common/FormConfigs';
import FormField from '../../components/common/FormField';

interface TenantFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const TenantForm: React.FC<TenantFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
  const handleSubmit = (formData: any) => {
    const userData = localStorage.getItem('user');
    let submissionData = { ...formData };
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        submissionData.hostelId = user.hostelId;
        submissionData.hostelName = user.hostelName;
      } catch (error) {
        console.error('Error processing user data:', error);
      }
    }
    
    onSubmit(submissionData);
  };

  const handleAadharPhoto = (type: 'front' | 'back', formData: any, handleFieldChange: any) => {
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
          handleFieldChange(fieldName, result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderAadharStep = (formData: any, errors: any, handleFieldChange: any, handleClearError: any) => (
    <Box>
      <Box sx={{ mb: 3, width: '100%' }}>
        <FormField
          config={{
            ...tenantFields.find(f => f.name === 'aadharNumber')!,
            flex: '1 1 100%'
          }}
          value={formData['aadharNumber']}
          onChange={handleFieldChange}
          error={errors['aadharNumber']}
          onClearError={handleClearError}
        />
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 2, sm: 3 } }}>
        {['front', 'back'].map(type => {
          const fieldName = `aadhar${type.charAt(0).toUpperCase() + type.slice(1)}`;
          return (
            <Box key={type}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Aadhar {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  bgcolor: formData[fieldName] ? 'transparent' : '#f9f9f9',
                  '&:hover': { borderColor: 'primary.main' },
                  overflow: 'hidden'
                }}
                onClick={() => handleAadharPhoto(type as 'front' | 'back', formData, handleFieldChange)}
              >
                {formData[fieldName] ? (
                  <img 
                    src={formData[fieldName]} 
                    alt={`Aadhar ${type}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <CameraAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Capture Aadhar {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Typography>
                  </>
                )}
              </Box>
              {errors[fieldName] && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors[fieldName]}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const steps = [
    {
      label: window.innerWidth < 600 ? 'Basic Details' : 'Step 1: Basic Details',
      fields: ['name', 'email', 'phone', 'gender', 'roomId', 'rent', 'deposit', 'joiningDate']
    },
    {
      label: window.innerWidth < 600 ? 'Documents' : 'Step 2: Aadhar Documents',
      fields: ['aadharNumber', 'aadharFront', 'aadharBack'],
      customRender: renderAadharStep
    }
  ];

  return (
    <MultiStepForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      editingItem={editingItem}
      title="Tenant"
      fields={tenantFields}
      steps={steps}
    />
  );
};

export default TenantForm;
