import React from 'react';
import DynamicForm from '../../components/common/DynamicForm';
import { paymentFormFields } from './formConfig';

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
  const handleSubmit = async (formData: any) => {
    try {
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
      
      await onSubmit(submissionData);
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
      title="Payment"
      fields={paymentFormFields}
    />
  );
};

export default PaymentForm;
