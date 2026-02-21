// Utility functions to help configure mobile filters for list pages

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface SortOption {
  key: string;
  label: string;
  order: 'asc' | 'desc';
}

// Common filter configurations
export const createStatusFilter = (statuses: { value: string; label: string; emoji?: string }[]): FilterOption => ({
  key: 'status',
  label: 'Status',
  options: statuses.map(status => ({
    value: status.value,
    label: status.emoji ? `${status.emoji} ${status.label}` : status.label
  }))
});

export const createRoomTypeFilter = (): FilterOption => ({
  key: 'roomType',
  label: 'Room Type',
  options: [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'triple', label: 'Triple' },
    { value: 'dormitory', label: 'Dormitory' }
  ]
});

// Common sort configurations
export const createNameSort = (): SortOption[] => [
  { key: 'name', label: '👤 Name A-Z', order: 'asc' },
  { key: 'name', label: '👤 Name Z-A', order: 'desc' }
];

export const createDateSort = (fieldKey: string, label: string): SortOption[] => [
  { key: fieldKey, label: `📅 ${label} (Newest)`, order: 'desc' },
  { key: fieldKey, label: `📅 ${label} (Oldest)`, order: 'asc' }
];

export const createAmountSort = (fieldKey: string, label: string): SortOption[] => [
  { key: fieldKey, label: `💰 ${label} (Low to High)`, order: 'asc' },
  { key: fieldKey, label: `💰 ${label} (High to Low)`, order: 'desc' }
];

// Common filter field functions
export const statusFilterField = (item: any) => item.status;
export const roomTypeFilterField = (item: any) => item.roomType || 'single';

// Common sort field functions
export const nameSortField = (a: any, b: any) => a.name.localeCompare(b.name);
export const dateSortField = (fieldKey: string) => (a: any, b: any) => 
  new Date(a[fieldKey] || 0).getTime() - new Date(b[fieldKey] || 0).getTime();
export const numberSortField = (fieldKey: string) => (a: any, b: any) => 
  (a[fieldKey] || 0) - (b[fieldKey] || 0);

// Preset configurations for common entities
export const getTenantFilters = (): {
  filterOptions: FilterOption[];
  sortOptions: SortOption[];
  filterFields: Record<string, (item: any) => string>;
  sortFields: Record<string, (a: any, b: any) => number>;
} => ({
  filterOptions: [
    createStatusFilter([
      { value: 'active', label: 'Active', emoji: '🟢' },
      { value: 'vacated', label: 'Vacated', emoji: '🔴' },
      { value: 'notice', label: 'Notice Period', emoji: '🟡' }
    ]),
    createRoomTypeFilter()
  ],
  sortOptions: [
    ...createNameSort(),
    ...createDateSort('joiningDate', 'Joining Date'),
    ...createAmountSort('rent', 'Rent'),
    { key: 'dues', label: '🔴 Highest Dues First', order: 'desc' }
  ],
  filterFields: {
    status: statusFilterField,
    roomType: roomTypeFilterField
  },
  sortFields: {
    name: nameSortField,
    joiningDate: dateSortField('joiningDate'),
    rent: numberSortField('rent'),
    dues: numberSortField('pendingDues')
  }
});

export const getPaymentFilters = (): {
  filterOptions: FilterOption[];
  sortOptions: SortOption[];
  filterFields: Record<string, (item: any) => string>;
  sortFields: Record<string, (a: any, b: any) => number>;
} => ({
  filterOptions: [
    createStatusFilter([
      { value: 'paid', label: 'Paid', emoji: '✅' },
      { value: 'pending', label: 'Pending', emoji: '⏳' },
      { value: 'overdue', label: 'Overdue', emoji: '🔴' }
    ])
  ],
  sortOptions: [
    ...createDateSort('paymentDate', 'Payment Date'),
    ...createAmountSort('amount', 'Amount'),
    { key: 'tenantName', label: '👤 Tenant A-Z', order: 'asc' }
  ],
  filterFields: {
    status: statusFilterField
  },
  sortFields: {
    paymentDate: dateSortField('paymentDate'),
    amount: numberSortField('amount'),
    tenantName: (a, b) => (a.tenantName || '').localeCompare(b.tenantName || '')
  }
});

export const getComplaintFilters = (): {
  filterOptions: FilterOption[];
  sortOptions: SortOption[];
  filterFields: Record<string, (item: any) => string>;
  sortFields: Record<string, (a: any, b: any) => number>;
} => ({
  filterOptions: [
    createStatusFilter([
      { value: 'open', label: 'Open', emoji: '🔴' },
      { value: 'in-progress', label: 'In Progress', emoji: '🟡' },
      { value: 'resolved', label: 'Resolved', emoji: '🟢' }
    ]),
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'high', label: '🔴 High' },
        { value: 'medium', label: '🟡 Medium' },
        { value: 'low', label: '🟢 Low' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'maintenance', label: '🔧 Maintenance' },
        { value: 'food', label: '🍽️ Food' },
        { value: 'noise', label: '🔊 Noise' },
        { value: 'technical', label: '💻 Technical' },
        { value: 'security', label: '🔒 Security' }
      ]
    }
  ],
  sortOptions: [
    ...createDateSort('createdAt', 'Created Date'),
    { key: 'priority', label: '🔴 Priority (High to Low)', order: 'desc' },
    { key: 'status', label: '🔴 Open First', order: 'desc' },
    { key: 'tenantName', label: '👤 Tenant A-Z', order: 'asc' }
  ],
  filterFields: {
    status: statusFilterField,
    priority: (item: any) => item.priority,
    category: (item: any) => item.category
  },
  sortFields: {
    createdAt: dateSortField('createdAt'),
    priority: (a: any, b: any) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
    },
    status: (a: any, b: any) => {
      const statusOrder = { open: 4, 'in-progress': 3, resolved: 2, closed: 1 };
      return (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
             (statusOrder[b.status as keyof typeof statusOrder] || 0);
    },
    tenantName: (a: any, b: any) => (a.tenantName || '').localeCompare(b.tenantName || '')
  }
});
