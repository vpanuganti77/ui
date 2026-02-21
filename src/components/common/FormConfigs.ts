import { FieldConfig } from './FormField';

// Validation functions
export const validations = {
  email: (value: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },
  phone: (value: string) => {
    if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  },
  aadhar: (value: string) => {
    if (!/^[0-9]{12}$/.test(value)) {
      return 'Please enter a valid 12-digit Aadhar number';
    }
    return '';
  },
  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return '';
  },
  positiveNumber: (value: string) => {
    if (isNaN(Number(value)) || Number(value) <= 0) {
      return 'Must be a positive number';
    }
    return '';
  },
  roomNumber: (value: string | number) => {
    const strValue = String(value);
    if (!strValue || !/^[0-9]+$/.test(strValue)) {
      return 'Room number must contain only digits (e.g., 101, 102)';
    }
    return '';
  },
};

// Common field configurations
export const tenantFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    validation: validations.minLength(2),
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    validation: validations.email,
    getDisabled: (editingItem?: any) => !!editingItem,
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: true,
    validation: validations.phone,
    getDisabled: (editingItem?: any) => !!editingItem,
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    name: 'roomId',
    label: 'Select Room',
    type: 'select',
    required: true,
    options: [], // Will be populated by loadOptions
    loadOptions: async (editingItem?: any) => {
      try {
        const { getAll } = await import('../../shared/services/storage/fileDataService');
        const rooms = await getAll('rooms');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const hostelRooms = rooms.filter((room: any) => 
          room.hostelId === user.hostelId || 
          !room.hostelId || 
          room.hostelId === ''
        );
        
        const filteredRooms = hostelRooms.filter((room: any) => {
          if (editingItem && room.roomNumber === editingItem.room) {
            return true;
          }
          return true;
        });
        
        const options = filteredRooms.map((room: any) => ({
          value: room.roomNumber,
          label: `${room.roomNumber} - ${room.type || 'Room'} (₹${room.rent?.toLocaleString() || '0'})`,
          rent: room.rent
        }));
        
        return options;
      } catch (error) {
        console.error('Failed to load rooms:', error);
        return [];
      }
    },
  },
  {
    name: 'rent',
    label: 'Monthly Rent',
    type: 'number',
    required: true,
    disabled: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'deposit',
    label: 'Security Deposit',
    type: 'number',
    required: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'joiningDate',
    label: 'Joining Date',
    type: 'date',
    required: true,
    min: new Date().toISOString().split('T')[0],
  },
  {
    name: 'aadharNumber',
    label: 'Aadhar Number',
    type: 'text',
    required: true,
    validation: validations.aadhar,
    flex: '1 1 100%',
    getDisabled: (editingItem?: any) => !!editingItem,
  },
  {
    name: 'aadharFront',
    label: 'Capture Aadhar Front',
    type: 'camera',
    required: true,
  },
  {
    name: 'aadharBack',
    label: 'Capture Aadhar Back',
    type: 'camera',
    required: true,
  },
];

export const roomFields: FieldConfig[] = [
  {
    name: 'roomNumber',
    label: 'Room Number',
    type: 'text',
    required: true,
    validation: validations.roomNumber,
    placeholder: '101, 102, 201...',
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
      { value: '8', label: '8 Beds (Large Dormitory)' },
    ],
  },
  {
    name: 'rent',
    label: 'Monthly Rent',
    type: 'number',
    required: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'floor',
    label: 'Floor',
    type: 'number',
    required: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'amenities',
    label: 'Amenities',
    type: 'textarea',
    placeholder: 'WiFi, AC, Attached Bathroom, Balcony, Window, Ceiling Fan, Study Table, Chair, Wardrobe, Bed',
    rows: 2,
    flex: '1 1 100%',
  },
];

export const paymentFields: FieldConfig[] = [
  {
    name: 'tenantId',
    label: 'Tenant ID',
    type: 'text',
    required: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'type',
    label: 'Payment Type',
    type: 'select',
    options: [
      { value: 'rent', label: 'Rent' },
      { value: 'deposit', label: 'Deposit' },
      { value: 'electricity', label: 'Electricity' },
      { value: 'food', label: 'Food' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    name: 'month',
    label: 'Month',
    type: 'month',
    required: true,
  },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    type: 'select',
    options: [
      { value: 'cash', label: 'Cash' },
      { value: 'online', label: 'Online' },
      { value: 'card', label: 'Card' },
      { value: 'upi', label: 'UPI' },
    ],
  },
  {
    name: 'transactionId',
    label: 'Transaction ID',
    type: 'text',
    flex: '1 1 100%',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    rows: 3,
    flex: '1 1 100%',
  },
];

export const userFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    validation: validations.minLength(2),
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    validation: validations.email,
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: true,
    validation: validations.phone,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'receptionist', label: 'Receptionist' },
      { value: 'tenant', label: 'Tenant' },
    ],
  },
  {
    name: 'password',
    label: 'Password (leave blank to keep current)',
    type: 'password',
    flex: '1 1 100%',
    validation: validations.minLength(6),
  },
];

export const complaintFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Complaint Title',
    type: 'text',
    required: true,
    flex: '1 1 100%',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 3,
    flex: '1 1 100%',
  },
  {
    name: 'attachments',
    label: 'Attachments (Photos/Screenshots)',
    type: 'file',
    accept: 'image/*',
    multiple: true,
    flex: '1 1 100%',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [],
    loadOptions: async (editingItem?: any) => {
      const allStatuses = [
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ];
      
      // If not editing (new complaint), only allow 'open'
      if (!editingItem) {
        return [{ value: 'open', label: 'Open' }];
      }
      
      // Define status progression order
      const statusOrder = ['open', 'in-progress', 'resolved', 'closed'];
      const currentStatusIndex = statusOrder.indexOf(editingItem.status);
      
      // Only allow current status and future statuses (no going backwards)
      const allowedStatuses = allStatuses.filter((status, index) => {
        return index >= currentStatusIndex;
      });
      
      return allowedStatuses;
    },
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'food', label: 'Food' },
      { value: 'noise', label: 'Noise' },
      { value: 'technical', label: 'Technical' },
      { value: 'security', label: 'Security' },
      { value: 'cleanliness', label: 'Cleanliness' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    name: 'adminNotes',
    label: 'Admin Notes',
    type: 'textarea',
    rows: 2,
    flex: '1 1 100%',
  },
];

export const expenseFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Expense Title',
    type: 'text',
    required: true,
    flex: '1 1 100%',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 3,
    flex: '1 1 100%',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Utilities', label: 'Utilities' },
      { value: 'Food', label: 'Food' },
      { value: 'Supplies', label: 'Supplies' },
      { value: 'Staff Salary', label: 'Staff Salary' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true,
  },
];

export const staffFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    validation: validations.minLength(2),
  },
  {
    name: 'role',
    label: 'Role/Position',
    type: 'select',
    required: true,
    options: [
      { value: 'Security Guard', label: 'Security Guard' },
      { value: 'Housekeeping', label: 'Housekeeping' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Cook', label: 'Cook' },
      { value: 'Receptionist', label: 'Receptionist' },
      { value: 'Manager', label: 'Manager' },
      { value: 'Cleaner', label: 'Cleaner' },
      { value: 'Electrician', label: 'Electrician' },
      { value: 'Plumber', label: 'Plumber' },
    ],
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'text',
    required: true,
    validation: validations.phone,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    validation: validations.email,
  },
  {
    name: 'salary',
    label: 'Monthly Salary (₹)',
    type: 'number',
    required: true,
    validation: validations.positiveNumber,
  },
  {
    name: 'joiningDate',
    label: 'Joining Date',
    type: 'date',
    required: true,
  },
  {
    name: 'shift',
    label: 'Work Shift',
    type: 'select',
    required: true,
    options: [
      { value: 'day', label: 'Day Shift (6 AM - 6 PM)' },
      { value: 'night', label: 'Night Shift (6 PM - 6 AM)' },
      { value: 'rotating', label: 'Rotating Shifts' },
    ],
  },
  {
    name: 'emergencyContact',
    label: 'Emergency Contact',
    type: 'text',
    required: true,
    validation: validations.phone,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    rows: 1,
  },
];

export const supportTicketFields: FieldConfig[] = [
  {
    name: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    flex: '1 1 100%',
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    rows: 4,
    flex: '1 1 100%',
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'technical', label: 'Technical Issue' },
      { value: 'account', label: 'Account Issue' },
      { value: 'billing', label: 'Billing Question' },
      { value: 'feature', label: 'Feature Request' },
      { value: 'other', label: 'Other' },
    ],
  },
];

export const hostelFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Hostel Name',
    type: 'text',
    required: true,
    validation: validations.minLength(2),
  },
  {
    name: 'planType',
    label: 'Plan Type',
    type: 'select',
    required: true,
    options: [
      { value: 'free_trial', label: 'Free Trial - 30 Days' },
      { value: 'basic', label: 'Basic Plan - ₹2,999/month' },
      { value: 'standard', label: 'Standard Plan - ₹4,999/month' },
      { value: 'premium', label: 'Premium Plan - ₹7,999/month' },
      { value: 'enterprise', label: 'Enterprise Plan - ₹12,999/month' },
    ],
  },
  {
    name: 'address',
    label: 'Hostel Address',
    type: 'textarea',
    required: true,
    rows: 2,
    flex: '1 1 100%',
  },
  {
    name: 'adminName',
    label: 'Admin Full Name',
    type: 'text',
    required: true,
    validation: validations.minLength(2),
  },
  {
    name: 'adminEmail',
    label: 'Admin Email',
    type: 'email',
    required: true,
    validation: validations.email,
  },
  {
    name: 'adminPhone',
    label: 'Admin Phone',
    type: 'text',
    required: true,
    validation: validations.phone,
  },
  {
    name: 'features',
    label: 'Enabled Features',
    type: 'multiselect',
    required: true,
    options: [
      { value: 'tenant_management', label: 'Tenant Management' },
      { value: 'room_management', label: 'Room Management' },
      { value: 'payment_tracking', label: 'Payment Tracking' },
      { value: 'complaint_system', label: 'Complaint System' },
      { value: 'staff_management', label: 'Staff Management' },
      { value: 'expense_tracking', label: 'Expense Tracking' },
      { value: 'reports_analytics', label: 'Reports & Analytics' },
      { value: 'bulk_operations', label: 'Bulk Operations' },
      { value: 'sms_notifications', label: 'SMS Notifications' },
      { value: 'email_notifications', label: 'Email Notifications' },
      { value: 'mobile_app', label: 'Mobile App Access' },
      { value: 'api_access', label: 'API Access' },
      { value: 'custom_branding', label: 'Custom Branding' },
      { value: 'priority_support', label: 'Priority Support' },
    ],
  },
];
