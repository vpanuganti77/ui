import React from 'react';
import DynamicForm from '../../components/common/DynamicForm';
import { complaintFormFields } from './formConfig';

interface ComplaintFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
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
      title="Complaint"
      fields={complaintFormFields}
    />
  );
};

export default ComplaintForm;
