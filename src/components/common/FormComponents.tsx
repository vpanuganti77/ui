import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface ValidationState {
  status: 'checking' | 'available' | 'taken' | null;
  message: string;
}

interface ReusableTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  type?: string;
  placeholder?: string;
  validation?: ValidationState;
  gridColumn?: string;
}

export const ReusableTextField: React.FC<ReusableTextFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  type = 'text',
  placeholder = '',
  validation,
  gridColumn
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      fullWidth
      error={error}
      helperText={helperText}
      type={type}
      placeholder={placeholder}
      sx={{ gridColumn }}
      InputProps={{
        endAdornment: validation?.status && (
          <InputAdornment position="end">
            {validation.status === 'checking' && <CircularProgress size={20} />}
            {validation.status === 'available' && <CheckCircle color="success" />}
            {validation.status === 'taken' && <Cancel color="error" />}
          </InputAdornment>
        )
      }}
    />
  );
};

interface ReusableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: boolean;
  helperText?: string;
  gridColumn?: string;
}

export const ReusableSelect: React.FC<ReusableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error = false,
  helperText = '',
  gridColumn
}) => {
  return (
    <FormControl fullWidth required={required} error={error} sx={{ gridColumn }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
