import { FormFieldConfig } from '../../components/common/DynamicForm';

export const tenantFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
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
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: true,
    validation: 'phone'
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    name: 'roomId',
    label: 'Select Room',
    type: 'select',
    required: true,
    options: async () => {
      try {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        const rooms = await getAll('rooms');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const hostelRooms = rooms.filter((room: any) => 
          room.hostelId === user.hostelId && room.status === 'available'
        );
        
        return hostelRooms.map((room: any) => ({
          value: room.roomNumber,
          label: `${room.roomNumber} - ${room.type} (₹${room.rent.toLocaleString()})`,
          rent: room.rent
        }));
      } catch (error) {
        return [];
      }
    }
  },
  {
    name: 'rent',
    label: 'Monthly Rent',
    type: 'text',
    required: true,
    disabled: true
  },
  {
    name: 'deposit',
    label: 'Security Deposit',
    type: 'text',
    required: true
  },
  {
    name: 'joiningDate',
    label: 'Joining Date',
    type: 'date',
    required: true,
    min: new Date().toISOString().split('T')[0],
    validation: (value: string) => {
      const today = new Date().toISOString().split('T')[0];
      if (value && value < today) {
        return 'Joining date cannot be in the past';
      }
      return null;
    },
    gridColumn: '1 / -1'
  },
  {
    name: 'aadharNumber',
    label: 'Aadhar Number',
    type: 'text',
    required: true,
    gridColumn: '1 / -1'
  }
];
