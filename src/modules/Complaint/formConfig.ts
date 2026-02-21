import { FormFieldConfig } from '../../components/common/DynamicForm';

export const complaintFormFields: FormFieldConfig[] = [
  {
    name: 'tenantId',
    label: 'Tenant',
    type: 'select',
    required: true,
    options: async () => {
      try {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        const tenants = await getAll('tenants');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const hostelTenants = tenants.filter((tenant: any) => 
          tenant.hostelId === user.hostelId && tenant.status === 'active'
        );
        
        return hostelTenants.map((tenant: any) => ({
          value: tenant.id,
          label: `${tenant.name} - Room ${tenant.room || tenant.roomId}`
        }));
      } catch (error) {
        return [];
      }
    }
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'cleanliness', label: 'Cleanliness' },
      { value: 'noise', label: 'Noise' },
      { value: 'facilities', label: 'Facilities' },
      { value: 'security', label: 'Security' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'open', label: 'Open' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' }
    ]
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    gridColumn: '1 / -1'
  },
  {
    name: 'assignedTo',
    label: 'Assigned To',
    type: 'text',
    gridColumn: '1 / -1'
  }
];
