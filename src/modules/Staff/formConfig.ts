import { FormFieldConfig } from '../../components/common/DynamicForm';

export const staffFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: true
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: [
      { value: 'manager', label: 'Manager' },
      { value: 'security', label: 'Security' },
      { value: 'cleaner', label: 'Cleaner' },
      { value: 'cook', label: 'Cook' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'receptionist', label: 'Receptionist' }
    ]
  },
  {
    name: 'salary',
    label: 'Salary',
    type: 'text',
    required: true
  },
  {
    name: 'joinDate',
    label: 'Join Date',
    type: 'date',
    required: true,
    min: new Date().toISOString().split('T')[0]
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    required: true
  },
  {
    name: 'emergencyContact',
    label: 'Emergency Contact',
    type: 'text'
  }
];
