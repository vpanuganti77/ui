import React from 'react';
import DynamicForm from '../../components/common/DynamicForm';
import { staffFormFields } from './formConfig';

interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const StaffForm: React.FC<StaffFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
  const handleSubmit = async (formData: any) => {
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <DynamicForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      editingItem={editingItem}
      title="Staff"
      fields={staffFormFields}
    />
  );
};

export default StaffForm;
