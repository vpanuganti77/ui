import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
  Switch,
  Button,
  Box,
  Typography,
  Chip,
  OutlinedInput,
  Tooltip,
  IconButton,
} from '@mui/material';
import { CameraAlt, Info } from '@mui/icons-material';
import AvailabilityIndicator from './AvailabilityIndicator';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'month' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'switch' | 'textarea' | 'file' | 'camera' | 'chips';
  required?: boolean;
  options?: { value: string; label: string; rent?: number }[];
  loadOptions?: (editingItem?: any) => Promise<{ value: string; label: string; rent?: number }[]>;
  placeholder?: string;
  rows?: number;
  accept?: string;
  capture?: boolean;
  multiple?: boolean;
  flex?: string;
  width?: string;
  disabled?: boolean;
  getDisabled?: (editingItem?: any) => boolean;
  validation?: (value: any) => string;
  uniquenessCheck?: (value: string, editingItem?: any) => Promise<{ isUnique: boolean; message: string }>;
  min?: string;
  max?: string;
}

interface FormFieldProps {
  config: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  onClearError?: (name: string) => void;
  editingItem?: any;
  onAvailabilityChange?: (fieldName: string, isAvailable: boolean) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  config,
  value,
  onChange,
  error,
  onClearError,
  editingItem,
  onAvailabilityChange,
}) => {
  const [isAvailable, setIsAvailable] = React.useState(true);

  const shouldShowAvailability = ['name', 'email', 'phone'].includes(config.name);

  const handleAvailabilityChange = React.useCallback((available: boolean) => {
    setIsAvailable(available);
    if (onAvailabilityChange) {
      onAvailabilityChange(config.name, available);
    }
  }, [config.name, onAvailabilityChange]);
  const handleChange = (newValue: any) => {
    onChange(config.name, newValue);
    if (error && onClearError) {
      onClearError(config.name);
    }
  };

  const fieldStyle = {
    width: '100%',
  };

  switch (config.type) {
    case 'select':
      const hasOptions = config.options && config.options.length > 0;
      return (
        <Box sx={{ position: 'relative' }}>
          <FormControl sx={fieldStyle} error={!!error} size="small">
            <InputLabel>{config.label}</InputLabel>
            <Select
              value={value || ''}
              label={config.label}
              onChange={(e) => handleChange(e.target.value)}
              disabled={!hasOptions}
            >
              {hasOptions ? (
                config.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  {config.name === 'roomId' ? 'No available rooms found' : 'No options available'}
                </MenuItem>
              )}
            </Select>
            {error && (
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                {error}
              </Typography>
            )}
          </FormControl>
          {config.name === 'roomId' && !hasOptions && (
            <Tooltip title="Create rooms in the Rooms section before adding tenants" arrow placement="top">
              <IconButton 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  right: 32, 
                  top: 8, 
                  zIndex: 1,
                  p: 0.5
                }}
              >
                <Info sx={{ fontSize: 16, color: 'info.main' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <FormControl sx={fieldStyle} error={!!error} size="small">
          <InputLabel>{config.label}</InputLabel>
          <Select
            multiple
            value={selectedValues}
            label={config.label}
            onChange={(e) => {
              const newValue = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
              handleChange(newValue);
            }}
            input={<OutlinedInput label={config.label} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((val) => {
                  const option = config.options?.find(opt => opt.value === val);
                  return (
                    <Chip key={val} label={option?.label || val} size="small" />
                  );
                })}
              </Box>
            )}
          >
            {config.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={selectedValues.indexOf(option.value) > -1} />
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && (
            <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
              {error}
            </Typography>
          )}
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl sx={fieldStyle} error={!!error}>
          <FormLabel>{config.label}</FormLabel>
          <RadioGroup
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            row
          >
            {config.options?.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          sx={fieldStyle}
          control={
            <Checkbox
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
            />
          }
          label={config.label}
        />
      );

    case 'switch':
      return (
        <FormControlLabel
          sx={fieldStyle}
          control={
            <Switch
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
            />
          }
          label={config.label}
        />
      );

    case 'textarea':
      return (
        <TextField
          sx={fieldStyle}
          label={config.label}
          multiline
          rows={config.rows || 3}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={config.placeholder}
          error={!!error}
          helperText={error}
          size="small"
        />
      );

    case 'camera':
      return (
        <Box sx={fieldStyle}>
          <Button
            variant="outlined"
            startIcon={<CameraAlt />}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleChange(file);
              };
              input.click();
            }}
            fullWidth
            sx={{ mb: 1 }}
          >
            {config.label}
          </Button>
          {value && (
            <Typography variant="body2" color="success.main">
              ✓ Photo captured
            </Typography>
          )}
        </Box>
      );

    case 'file':
      return (
        <Box sx={fieldStyle}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
          >
            {config.label}
            <input
              type="file"
              hidden
              accept={config.accept}
              multiple={config.multiple}
              onChange={(e) => {
                if (config.multiple) {
                  const files = Array.from(e.target.files || []);
                  handleChange(files);
                } else {
                  const file = e.target.files?.[0];
                  if (file) handleChange(file);
                }
              }}
            />
          </Button>
          {value && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              ✓ {config.multiple && Array.isArray(value) 
                ? `${value.length} file(s) selected` 
                : (value.name || 'File selected')}
            </Typography>
          )}
        </Box>
      );

    case 'chips':
      const selectedChips = Array.isArray(value) ? value : [];
      return (
        <Box sx={fieldStyle}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {config.label}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {config.options?.map((option) => {
              const isSelected = selectedChips.includes(option.value);
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  onClick={() => {
                    const newValue = isSelected
                      ? selectedChips.filter(v => v !== option.value)
                      : [...selectedChips, option.value];
                    handleChange(newValue);
                  }}
                />
              );
            })}
          </Box>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              {error}
            </Typography>
          )}
        </Box>
      );

    default:
      const showRequiredError = error && (!value || value.trim().length === 0);
      
      return (
        <TextField
          sx={fieldStyle}
          label={config.label}
          type={config.type}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={config.placeholder}
          error={!!error || (shouldShowAvailability && !isAvailable)}
          helperText={showRequiredError ? error : undefined}
          disabled={config.disabled || config.getDisabled?.(editingItem)}
          size="small"
          InputLabelProps={
            config.type === 'date' || config.type === 'month'
              ? { shrink: true }
              : undefined
          }
          inputProps={{
            ...(config.type === 'date' && config.min && { min: config.min }),
            ...(config.type === 'date' && config.max && { max: config.max })
          }}
          InputProps={{
            endAdornment: shouldShowAvailability ? (
              <AvailabilityIndicator
                value={value || ''}
                type={config.name as 'name' | 'email' | 'phone'}
                excludeId={editingItem?.id}
                onAvailabilityChange={handleAvailabilityChange}
              />
            ) : undefined
          }}
        />
      );
  }
};

export default FormField;
