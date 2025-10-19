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
} from '@mui/material';
import { CameraAlt } from '@mui/icons-material';

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
  flex?: string;
  width?: string;
  disabled?: boolean;
  validation?: (value: any) => string;
}

interface FormFieldProps {
  config: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  onClearError?: (name: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  config,
  value,
  onChange,
  error,
  onClearError,
}) => {
  const handleChange = (newValue: any) => {
    onChange(config.name, newValue);
    if (error && onClearError) {
      onClearError(config.name);
    }
  };

  const fieldStyle = {
    flex: config.flex || '1 1 200px',
    width: config.width,
  };

  switch (config.type) {
    case 'select':
      return (
        <FormControl sx={fieldStyle} error={!!error}>
          <InputLabel>{config.label}</InputLabel>
          <Select
            value={value || ''}
            label={config.label}
            onChange={(e) => handleChange(e.target.value)}
          >
            {config.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
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

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <FormControl sx={fieldStyle} error={!!error}>
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange(file);
              }}
            />
          </Button>
          {value && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              ✓ {value.name || 'File selected'}
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
      return (
        <TextField
          sx={fieldStyle}
          label={config.label}
          type={config.type}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={config.placeholder}
          error={!!error}
          helperText={error}
          disabled={config.disabled}
          InputLabelProps={
            config.type === 'date' || config.type === 'month'
              ? { shrink: true }
              : undefined
          }
        />
      );
  }
};

export default FormField;