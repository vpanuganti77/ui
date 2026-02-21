import React from 'react';
import DynamicForm from '../../components/common/DynamicForm';
import { expenseFormFields } from './formConfig';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ open, onClose, onSubmit, editingItem }) => {
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
      title="Expense"
      fields={expenseFormFields}
    />
  );
};

export default ExpenseForm;
