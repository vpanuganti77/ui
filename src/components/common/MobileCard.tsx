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
}

const MobileCard: React.FC<MobileCardProps> = ({
  item,
  titleField,
  fields,
  onEdit,
  onDelete,
  onItemClick,
  idField = 'id'
}) => {
  return (
    <Card key={item[idField]} sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: onItemClick ? 'primary.main' : 'text.primary',
              cursor: onItemClick ? 'pointer' : 'default'
            }}
            onClick={() => onItemClick?.(item[idField])}
          >
            {item[titleField]}
          </Typography>
          <Box display="flex" gap={0.5}>
            <IconButton size="small" onClick={() => onEdit(item[idField])}>
              <Edit fontSize="small" color="primary" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(item[idField])}>
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Box>
        </Box>
        <Stack spacing={1}>
          {fields.map(field => {
            // Check condition if provided
            if (field.condition && !field.condition(item)) {
              return null;
            }

            const value = item[field.key];
            
            return (
              <Box key={field.key} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {field.label}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: field.key === 'rent' || field.key === 'amount' ? 600 : 400 }}>
                  {field.render ? field.render(value) : value}
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