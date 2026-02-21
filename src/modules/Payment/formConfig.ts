import { FormFieldConfig } from '../../components/common/DynamicForm';

export const paymentFormFields: FormFieldConfig[] = [
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
    name: 'amount',
    label: 'Amount',
    type: 'text',
    required: true
  },
  {
    name: 'type',
    label: 'Payment Type',
    type: 'select',
    required: true,
    options: [
      { value: 'rent', label: 'Rent' },
      { value: 'deposit', label: 'Deposit' },
      { value: 'electricity', label: 'Electricity' },
      { value: 'food', label: 'Food' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    name: 'month',
    label: 'Month',
    type: 'select',
    required: true,
    options: (() => {
      const months = [];
      const currentDate = new Date();
      
      // Add current month and next 11 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const value = date.toISOString().slice(0, 7); // YYYY-MM format
        months.push({ value, label: monthYear });
      }
      
      return months;
    })()
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
    name: 'transactionId',
    label: 'Transaction ID',
    type: 'text',
    validation: (value: string, formData: any) => {
      if (formData?.paymentMethod && formData.paymentMethod !== 'cash' && (!value || !value.trim())) {
        return 'Transaction ID is required for non-cash payments';
      }
      return null;
    }
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'text',
    gridColumn: '1 / -1'
  }
];
