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
import { Edit, Delete } from '@mui/icons-material';

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
        boxShadow: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ pb: '16px !important', p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '1.1rem',
              color: onItemClick ? 'primary.main' : 'text.primary',
              cursor: onItemClick ? 'pointer' : 'default',
              '&:hover': onItemClick ? { textDecoration: 'underline' } : {}
            }}
            onClick={() => onItemClick?.(item[idField])}
          >
            {item[titleField]}
          </Typography>
          <Box display="flex" gap={0.5}>
            {!hideEdit && (
              <IconButton 
                size="small" 
                onClick={() => onEdit(item[idField])}
                sx={{ 
                  bgcolor: 'primary.50',
                  '&:hover': { bgcolor: 'primary.100' }
                }}
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
              >
                <Delete fontSize="small" color="error" />
              </IconButton>
            )}
          </Box>
        </Box>
        <Stack spacing={1.5}>
          {fields.map(field => {
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
                sx={{
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'grey.100',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {field.label}:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: field.key === 'rent' || field.key === 'amount' ? 600 : 500,
                    color: field.key === 'rent' || field.key === 'amount' ? 'success.main' : 'text.primary'
                  }}
                >
                  {field.render ? field.render(value) : value || '-'}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MobileCard;