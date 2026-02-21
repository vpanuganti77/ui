import React from 'react';
import { Box, Typography } from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import MultiStepForm from '../../components/common/MultiStepForm';
import { tenantFields } from '../../components/common/FormConfigs';
import FormField from '../../components/common/FormField';
import { useAvailabilityStatus } from '../../hooks/useAvailabilityStatus';

interface TenantFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const TenantForm: React.FC<TenantFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
  const { availabilityStatus, updateAvailability, resetAvailability, isAllAvailable } = useAvailabilityStatus();
  const compressImage = (dataUrl: string, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl.split(',')[1]); // Return only base64 part
      };
      
      img.src = dataUrl;
    });
  };

  const handleSubmit = async (formData: any) => {
    // Check availability for required fields before submission
    const requiredFields = ['name', 'email', 'phone'];
    if (!isAllAvailable(requiredFields)) {
      console.error('Some fields are not available');
      return;
    }

    const userData = localStorage.getItem('user');
    let submissionData = { ...formData };
    
    // Compress and convert images to binary format on submit
    if (submissionData.aadharFront && submissionData.aadharFront.startsWith('data:')) {
      try {
        submissionData.aadharFront = await compressImage(submissionData.aadharFront);
      } catch (error) {
        console.error('Error compressing aadharFront:', error);
      }
    }
    
    if (submissionData.aadharBack && submissionData.aadharBack.startsWith('data:')) {
      try {
        submissionData.aadharBack = await compressImage(submissionData.aadharBack);
      } catch (error) {
        console.error('Error compressing aadharBack:', error);
      }
    }
    
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
    resetAvailability();
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
          editingItem={editingItem}
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
                    src={formData[fieldName].startsWith('data:') ? formData[fieldName] : `data:image/jpeg;base64,${formData[fieldName]}`} 
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
      fields: ['name', 'email', 'phone', 'gender', 'roomId', 'rent', 'deposit', 'joiningDate'],
      customRender: (formData: any, errors: any, handleFieldChange: any, handleClearError: any, updateAvailability?: (fieldName: string, isAvailable: boolean) => void) => (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
          gap: { xs: 1.5, sm: 2 } 
        }}>
          {['name', 'email', 'phone', 'gender', 'roomId', 'rent', 'deposit', 'joiningDate'].map(fieldName => {
            const field = tenantFields.find(f => f.name === fieldName);
            if (!field) return null;
            
            return (
              <FormField
                key={fieldName}
                config={field}
                value={formData[fieldName]}
                onChange={handleFieldChange}
                error={errors[fieldName]}
                onClearError={handleClearError}
                editingItem={editingItem}
                onAvailabilityChange={updateAvailability}
              />
            );
          })}
        </Box>
      )
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
      onClose={() => {
        resetAvailability();
        onClose();
      }}
      onSubmit={handleSubmit}
      editingItem={editingItem}
      title="Tenant"
      fields={tenantFields}
      steps={steps}
    />
  );
};

export default TenantForm;
