import React from 'react';
import { Chip } from '@mui/material';

// Helper functions for common renderers
export const currencyRenderer = (value: number) => `₹${value.toLocaleString()}`;

export const statusRenderer = (status: string, getColor: (status: string) => string) => (
  React.createElement(Chip, {
    label: status,
    color: getColor(status) as any,
    size: 'small',
    variant: 'filled'
  })
);

export const conditionalCurrencyRenderer = (value: number) => 
  value > 0 ? React.createElement('span', { style: { fontWeight: 600, color: '#d32f2f' } }, currencyRenderer(value)) : '-';

// Status color functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'vacated': return 'default';
    case 'notice': return 'warning';
    default: return 'default';
  }
};

export const getRoomStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'success';
    case 'occupied': return 'error';
    case 'maintenance': return 'warning';
    default: return 'default';
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'overdue': return 'error';
    default: return 'default';
  }
};

// Mobile card field configurations
export const tenantCardFields = [
  { key: 'phone', label: 'Phone', value: 'phone' },
  { key: 'room', label: 'Room', value: 'room' },
  { key: 'rent', label: 'Rent', value: 'rent', render: currencyRenderer },
  { key: 'status', label: 'Status', value: 'status', render: (value: string) => statusRenderer(value, getStatusColor) },
  { 
    key: 'pendingDues', 
    label: 'Dues', 
    value: 'pendingDues', 
    render: conditionalCurrencyRenderer,
    condition: (item: any) => item.pendingDues > 0
  }
];

export const roomCardFields = [
  { key: 'type', label: 'Type', value: 'type', render: (value: string) => value.charAt(0).toUpperCase() + value.slice(1) },
  { key: 'occupancy', label: 'Occupancy', value: 'occupancy', render: (value: number, item: any) => `${value}/${item.capacity}` },
  { key: 'rent', label: 'Rent', value: 'rent', render: currencyRenderer },
  { key: 'status', label: 'Status', value: 'status', render: (value: string) => statusRenderer(value, getRoomStatusColor) },
  { key: 'floor', label: 'Floor', value: 'floor' }
];

export const paymentCardFields = [
  { key: 'amount', label: 'Amount', value: 'amount', render: currencyRenderer },
  { key: 'month', label: 'Month', value: 'month' },
  { key: 'status', label: 'Status', value: 'status', render: (value: string) => statusRenderer(value, getPaymentStatusColor) },
  { 
    key: 'paymentDate', 
    label: 'Date', 
    value: 'paymentDate', 
    render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
  }
];

export const userCardFields = [
  { key: 'email', label: 'Email', value: 'email' },
  { key: 'phone', label: 'Phone', value: 'phone' },
  { key: 'role', label: 'Role', value: 'role', render: (value: string) => statusRenderer(value, (role) => role === 'admin' ? 'primary' : 'default') },
  { key: 'status', label: 'Status', value: 'status', render: (value: string) => statusRenderer(value || 'active', (status) => status === 'active' ? 'success' : 'error') }
];

export const complaintCardFields = [
  { key: 'category', label: 'Category', value: 'category', render: (value: string) => statusRenderer(value, () => 'primary') },
  { key: 'priority', label: 'Priority', value: 'priority', render: (value: string) => statusRenderer(value, (priority) => priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'info') },
  { key: 'status', label: 'Status', value: 'status', render: (value: string) => statusRenderer(value.replace('-', ' '), (status) => status === 'open' ? 'error' : status === 'in-progress' ? 'warning' : 'success') },
  { key: 'tenantName', label: 'Tenant', value: 'tenantName' },
  { key: 'room', label: 'Room', value: 'room' },
  { key: 'updatedAt', label: 'Updated', value: 'updatedAt', render: (value: string) => new Date(value).toLocaleDateString() }
];

export const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Maintenance': 'warning',
    'Utilities': 'info',
    'Food': 'success',
    'Supplies': 'secondary',
    'Staff Salary': 'error',
    'Other': 'default'
  };
  return colors[category] || 'default';
};

export const expenseCardFields = [
  { key: 'category', label: 'Category', value: 'category', render: (value: string) => statusRenderer(value, getCategoryColor) },
  { key: 'amount', label: 'Amount', value: 'amount', render: currencyRenderer },
  { key: 'date', label: 'Date', value: 'date', render: (value: string) => new Date(value).toLocaleDateString() },
  { key: 'addedBy', label: 'Added By', value: 'addedBy', render: (value: any) => value?.name || '-' }
];

export const getStaffStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'error';
    case 'on-leave': return 'warning';
    default: return 'default';
  }
};

export const getShiftColor = (shift: string) => {
  switch (shift) {
    case 'day': return 'primary';
    case 'night': return 'secondary';
    case 'rotating': return 'info';
    default: return 'default';
  }
};

export const staffCardFields = [
  { key: 'role', label: 'Role', value: 'role' },
  { key: 'phone', label: 'Phone', value: 'phone' },
  { key: 'salary', label: 'Salary', value: 'salary', render: (value: number) => `₹${value.toLocaleString()}/month` },
  { key: 'shift', label: 'Shift', value: 'shift', render: (value: string) => statusRenderer(value, getShiftColor) },
  { key: 'status', label: 'Status', value: 'status', render: (value: string) => statusRenderer(value, getStaffStatusColor) },
  { key: 'joiningDate', label: 'Joined', value: 'joiningDate', render: (value: string) => new Date(value).toLocaleDateString() }
];