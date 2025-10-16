# Dynamic Form System

This system eliminates repetitive dialog and form code across all admin pages.

## Components

### 1. FormField
Renders individual form fields based on configuration:
- Text, email, password, number inputs
- Select dropdowns, radio buttons, checkboxes
- Textareas, file uploads, camera capture
- Built-in validation

### 2. DynamicDialog
Renders complete dialogs with forms based on field configurations:
- Automatic form layout (2 fields per row)
- Built-in validation and error handling
- Snackbar notifications
- Edit/Add mode handling

### 3. FormConfigs
Centralized field configurations for all entities:
- `tenantFields`, `roomFields`, `paymentFields`, etc.
- Validation functions
- Field types and options

## Usage Example

```tsx
import DynamicDialog from '../../components/common/DynamicDialog';
import { roomFields } from '../../components/common/FormConfigs';

// In your component:
const [open, setOpen] = useState(false);
const [editingItem, setEditingItem] = useState(null);

const handleSubmit = (formData: any) => {
  // Handle form submission
  console.log('Form data:', formData);
  setOpen(false);
};

// In JSX:
<DynamicDialog
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={handleSubmit}
  title="Add Room"
  fields={roomFields}
  editingItem={editingItem}
  submitLabel="Room"
/>
```

## Field Configuration

```tsx
const customFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    validation: (value) => value.length < 3 ? 'Too short' : '',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    flex: '1 1 100%', // Full width
  },
];
```

## Benefits

1. **No Repetitive Code** - Single dialog component for all forms
2. **Consistent Validation** - Centralized validation logic
3. **Easy Maintenance** - Change field configs, not JSX
4. **Type Safety** - TypeScript interfaces for all configs
5. **Flexible Layout** - Automatic responsive layout
6. **Built-in Features** - Validation, errors, notifications included

## Migration

To convert existing dialogs:

1. Define field configuration in `FormConfigs.ts`
2. Replace dialog JSX with `<DynamicDialog>`
3. Remove form state, validation, and error handling code
4. Update submit handler to receive form data directly

Example: Tenants page reduced from 400+ lines to 50 lines of form code.