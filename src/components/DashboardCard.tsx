import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'primary' 
}) => {
  return (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea, #764ba2' : 
                                           color === 'success' ? '#11998e, #38ef7d' :
                                           color === 'warning' ? '#f093fb, #f5576c' :
                                           '#ff9a9e, #fecfef'})`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ opacity: 0.8 }}>
            {icon}
          </Box>
          {trend && (
            <Chip
              icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {title}
        </Typography>
      </CardContent>
      <Box sx={{ 
        position: 'absolute', 
        bottom: -20, 
        right: -20, 
        opacity: 0.1, 
        fontSize: 80 
      }}>
        {icon}
      </Box>
    </Card>
  );
};

export default DashboardCard;