import { FormFieldConfig } from '../../components/common/DynamicForm';

export const expenseFormFields: FormFieldConfig[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'utilities', label: 'Utilities' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'supplies', label: 'Supplies' },
      { value: 'food', label: 'Food' },
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'repairs', label: 'Repairs' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'text',
    required: true
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    gridColumn: '1 / -1'
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true
  },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    type: 'select',
    required: true,
    options: [
      { value: 'cash', label: 'Cash' },
      { value: 'online', label: 'Online' },
      { value: 'card', label: 'Card' },
      { value: 'upi', label: 'UPI' }
    ]
  },
  {
    name: 'receipt',
    label: 'Receipt Number',
    type: 'text',
    gridColumn: '1 / -1'
  }
];
