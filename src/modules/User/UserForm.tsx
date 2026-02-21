import React from 'react';
import DynamicForm from '../../components/common/DynamicForm';
import { userFormFields } from './formConfig';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
  const handleSubmit = (formData: any) => {
    let submissionData = { ...formData };
    
    if (!editingItem && formData.autoGeneratePassword) {
      submissionData.password = 'user' + Math.random().toString(36).substring(2, 8);
    }
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== 'master_admin' && formData.role !== 'master_admin') {
          submissionData.hostelId = user.hostelId;
          submissionData.hostelName = user.hostelName;
        }
      } catch (error) {
        console.error('Error processing user data:', error);
      }
    }
    
    onSubmit(submissionData);
    // Let ListPage handle dialog closing based on success/failure
  };

  return (
    <DynamicForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      editingItem={editingItem}
      title="User"
      fields={userFormFields}
    />
  );
};

export default UserForm;
