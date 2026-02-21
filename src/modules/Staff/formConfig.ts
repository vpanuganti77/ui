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
    required: true,
    gridColumn: '1 / -1'
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
    name: 'department',
    label: 'Department',
    type: 'select',
    required: true,
    options: [
      { value: 'administration', label: 'Administration' },
      { value: 'security', label: 'Security' },
      { value: 'housekeeping', label: 'Housekeeping' },
      { value: 'food', label: 'Food Service' },
      { value: 'maintenance', label: 'Maintenance' }
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
    type: 'text',
    required: true
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    required: true,
    gridColumn: '1 / -1'
  },
  {
    name: 'emergencyContact',
    label: 'Emergency Contact',
    type: 'text',
    gridColumn: '1 / -1'
  }
];
