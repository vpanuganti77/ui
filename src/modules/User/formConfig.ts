import { FormFieldConfig } from '../../components/common/DynamicForm';

export const userFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    validation: 'name'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    disabled: (editingItem) => !!editingItem,
    autoGenerate: (formData, editingItem) => {
      if (!formData.name || editingItem) return '';
      
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const username = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          if (formData.role === 'master_admin') {
            return `${username}@pgflow.com`;
          } else {
            const hostelName = user.hostelName || 'hostel';
            const cleanHostelName = hostelName.toLowerCase().replace(/[^a-z0-9]/g, '');
            return `${username}@${cleanHostelName}.com`;
          }
        } catch (error) {
          console.error('Error generating email:', error);
        }
      }
      return '';
    },
    helperText: (formData, editingItem) => {
      if (editingItem) return 'Email cannot be changed after creation';
      return '';
    }
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: true,
    validation: 'phone'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: () => {
      const userData = localStorage.getItem('user');
      const currentUserRole = userData ? JSON.parse(userData).role : '';
      
      const options = [];
      if (currentUserRole === 'master_admin') {
        options.push({ value: 'master_admin', label: 'Master Admin' });
      }
      if (currentUserRole === 'admin') {
        options.push(
          { value: 'admin', label: 'Admin' },
          { value: 'receptionist', label: 'Receptionist' },
          { value: 'tenant', label: 'Tenant' }
        );
      }
      if (currentUserRole === 'receptionist') {
        options.push(
          { value: 'receptionist', label: 'Receptionist' },
          { value: 'tenant', label: 'Tenant' }
        );
      }
      return options;
    }
  },
  {
    name: 'autoGeneratePassword',
    label: 'Auto-generate password',
    type: 'checkbox',
    gridColumn: '1 / -1'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: false,
    disabled: (editingItem) => false,
    gridColumn: '1 / -1',
    helperText: (formData, editingItem) => {
      if (!editingItem && formData.autoGeneratePassword) {
        return 'Password will be auto-generated';
      }
      if (editingItem) {
        return 'Leave blank to keep current password';
      }
      return '';
    }
  }
];
