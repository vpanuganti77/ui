# Mobile Filters Guide

The floating filter panel is now available as a generic feature for all list screens. When you scroll down on mobile, the filter and sort buttons appear in the top-right corner.

## Quick Setup

### 1. Basic Usage

```tsx
import ListPage from '../../components/common/ListPage';
import { getTenantFilters } from '../../utils/mobileFilterHelpers';

const MyListPage = () => {
  const { filterOptions, sortOptions, filterFields, sortFields } = getTenantFilters();

  return (
    <ListPage
      title="My List"
      data={[]}
      customDataLoader={async () => {
        // Load your data here
        return await loadData();
      }}
      enableMobileFilters={true}
      searchFields={['name', 'email', 'phone']}
      filterOptions={filterOptions}
      sortOptions={sortOptions}
      filterFields={filterFields}
      sortFields={sortFields}
      // ... other props
    />
  );
};
```

### 2. Using Preset Configurations

```tsx
import { getTenantFilters, getPaymentFilters, getComplaintFilters } from '../../utils/mobileFilterHelpers';

// For tenant lists
const tenantConfig = getTenantFilters();

// For payment lists  
const paymentConfig = getPaymentFilters();

// For complaint lists
const complaintConfig = getComplaintFilters();
```

### 3. Custom Configuration

```tsx
import { createStatusFilter, createNameSort, createAmountSort } from '../../utils/mobileFilterHelpers';

const filterOptions = [
  createStatusFilter([
    { value: 'active', label: 'Active', emoji: '🟢' },
    { value: 'inactive', label: 'Inactive', emoji: '🔴' }
  ]),
  {
    key: 'category',
    label: 'Category',
    options: [
      { value: 'premium', label: 'Premium' },
      { value: 'standard', label: 'Standard' }
    ]
  }
];

const sortOptions = [
  ...createNameSort(),
  ...createAmountSort('price', 'Price')
];

const filterFields = {
  status: (item) => item.status,
  category: (item) => item.category
};

const sortFields = {
  name: (a, b) => a.name.localeCompare(b.name),
  price: (a, b) => (a.price || 0) - (b.price || 0)
};
```

## Props Reference

### ListPage Mobile Filter Props

| Prop | Type | Description |
|------|------|-------------|
| `enableMobileFilters` | `boolean` | Enable mobile filter functionality |
| `searchFields` | `(keyof T)[]` | Fields to search in (immediate search) |
| `filterOptions` | `FilterOption[]` | Filter dropdown options |
| `sortOptions` | `SortOption[]` | Sort options for the sort drawer |
| `filterFields` | `Record<string, (item: T) => string>` | Functions to extract filter values |
| `sortFields` | `Record<string, (a: T, b: T) => number>` | Sort comparison functions |

### FilterOption Interface

```tsx
interface FilterOption {
  key: string;           // Field key to filter by
  label: string;         // Display label for the filter
  options: {             // Available filter values
    value: string;       // Filter value
    label: string;       // Display label for the option
  }[];
}
```

### SortOption Interface

```tsx
interface SortOption {
  key: string;           // Field key to sort by
  label: string;         // Display label for the sort option
  order: 'asc' | 'desc'; // Sort direction
}
```

## Features

- **Floating Panel**: Appears in top-right when scrolling down
- **Search**: Real-time search across specified fields
- **Filters**: Dropdown filters with apply/clear functionality
- **Sort**: Multiple sort options with visual feedback
- **Badge**: Shows active filter count
- **Responsive**: Only appears on mobile devices

## Helper Functions

### Status Filters
```tsx
createStatusFilter([
  { value: 'active', label: 'Active', emoji: '🟢' },
  { value: 'inactive', label: 'Inactive', emoji: '🔴' }
])
```

### Sort Options
```tsx
createNameSort()                           // Name A-Z, Z-A
createDateSort('createdAt', 'Created')     // Date newest/oldest
createAmountSort('price', 'Price')         // Amount low/high
```

### Filter Fields
```tsx
statusFilterField                          // (item) => item.status
roomTypeFilterField                        // (item) => item.roomType || 'single'
```

### Sort Fields
```tsx
nameSortField                              // (a, b) => a.name.localeCompare(b.name)
dateSortField('createdAt')                 // Date comparison function
numberSortField('amount')                  // Number comparison function
```

## Examples

### Simple List with Basic Filters
```tsx
<ListPage
  title="Users"
  data={[]}
  enableMobileFilters={true}
  searchFields={['name', 'email']}
  filterOptions={[
    createStatusFilter([
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ])
  ]}
  sortOptions={createNameSort()}
  filterFields={{ status: statusFilterField }}
  sortFields={{ name: nameSortField }}
  // ... other props
/>
```

### Complex List with Multiple Filters
```tsx
const { filterOptions, sortOptions, filterFields, sortFields } = getTenantFilters();

<ListPage
  title="Tenants"
  data={[]}
  enableMobileFilters={true}
  searchFields={['name', 'phone', 'room']}
  filterOptions={filterOptions}
  sortOptions={sortOptions}
  filterFields={filterFields}
  sortFields={sortFields}
  // ... other props
/>
```

This system makes it easy to add consistent mobile filtering to any list screen in your app!