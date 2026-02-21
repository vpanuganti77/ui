import { FormFieldConfig } from '../../components/common/DynamicForm';

export const roomFormFields: FormFieldConfig[] = [
  {
    name: 'roomNumber',
    label: 'Room Number',
    type: 'text',
    required: true,
    placeholder: '101, 102, 201...'
  },
  {
    name: 'capacity',
    label: 'Bed Capacity',
    type: 'select',
    required: true,
    options: [
      { value: '1', label: '1 Bed (Single)' },
      { value: '2', label: '2 Beds (Double Sharing)' },
      { value: '3', label: '3 Beds (Triple Sharing)' },
      { value: '4', label: '4 Beds (Quad Sharing)' },
      { value: '6', label: '6 Beds (Dormitory)' },
      { value: '8', label: '8 Beds (Large Dormitory)' }
    ]
  },
  {
    name: 'rent',
    label: 'Monthly Rent',
    type: 'text',
    required: true
  },
  {
    name: 'floor',
    label: 'Floor',
    type: 'text',
    required: true
  },
  {
    name: 'amenities',
    label: 'Amenities',
    type: 'text',
    placeholder: 'WiFi, AC, Attached Bathroom, Balcony...',
    gridColumn: '1 / -1'
  }
];
