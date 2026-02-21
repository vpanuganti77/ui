import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
  Chip,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

interface CardField {
  key: string;
  label: string;
  value: any;
  render?: (value: any) => React.ReactNode;
  condition?: (item: any) => boolean;
}

interface MobileCardProps {
  item: any;
  titleField: string;
  fields: CardField[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onItemClick?: (id: string) => void;
  idField?: string;
  hideDelete?: boolean;
  hideEdit?: boolean;
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: '#4caf50',
    available: '#4caf50', 
    occupied: '#ff9800',
    maintenance: '#f44336',
    pending: '#ff9800',
    resolved: '#4caf50',
    open: '#f44336',
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50'
  };
  return colorMap[status?.toLowerCase()] || '#757575';
};

const MobileCard: React.FC<MobileCardProps> = ({
  item,
  titleField,
  fields,
  onEdit,
  onDelete,
  onItemClick,
  idField = 'id',
  hideDelete = false,
  hideEdit = false
}) => {
  return (
    <Card 
      key={item[idField]} 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '1.1rem',
                color: onItemClick ? 'primary.main' : 'text.primary',
                cursor: onItemClick ? 'pointer' : 'default',
                '&:hover': onItemClick ? { textDecoration: 'underline' } : {},
                mb: 0.5
              }}
              onClick={() => onItemClick?.(item[idField])}
            >
              {item[titleField]}
            </Typography>
            {/* Show first field as subtitle */}
            {fields[0] && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                {fields[0].render ? fields[0].render(item[fields[0].key]) : item[fields[0].key]}
              </Typography>
            )}
          </Box>
          
          <Box display="flex" gap={0.5}>
            {!hideEdit && (
              <IconButton 
                size="small" 
                onClick={() => onEdit(item[idField])}
                sx={{ 
                  bgcolor: 'primary.50',
                  '&:hover': { bgcolor: 'primary.100' }
                }}
                title="Edit"
              >
                <Edit fontSize="small" color="primary" />
              </IconButton>
            )}
            {!hideDelete && (
              <IconButton 
                size="small" 
                onClick={() => onDelete(item[idField])}
                sx={{ 
                  bgcolor: 'error.50',
                  '&:hover': { bgcolor: 'error.100' }
                }}
                title="Delete"
              >
                <Delete fontSize="small" color="error" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Fields */}
        <Stack spacing={1.5}>
          {fields.slice(1).map((field, index) => {
            // Check condition if provided
            if (field.condition && !field.condition(item)) {
              return null;
            }

            const value = item[field.key];
            
            return (
              <Box 
                key={field.key} 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ py: 0.5 }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {field.label}:
                </Typography>
                
                {field.key === 'status' || field.key === 'priority' ? (
                  <Chip
                    label={field.render ? field.render(value) : value || '-'}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(value),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                ) : (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: field.key === 'rent' || field.key === 'amount' ? 600 : 500,
                      color: field.key === 'rent' || field.key === 'amount' ? 'success.main' : 'text.primary'
                    }}
                  >
                    {field.render ? field.render(value) : value || '-'}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MobileCard;
