import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import { Announcement, PriorityHigh, Info } from '@mui/icons-material';
import { useListManager } from '../../hooks/useListManager';

const CustomerNotices: React.FC = () => {
  const { data: notices } = useListManager({
    entityName: 'Notice',
    entityKey: 'notices'
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <PriorityHigh />;
      case 'normal': return <Announcement />;
      default: return <Info />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'normal': return 'primary';
      default: return 'default';
    }
  };



  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Notices & Announcements
      </Typography>

      {!notices || notices.length === 0 ? (
        <Alert severity="info">No notices available at the moment.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notices.map((notice: any) => (
            <Card key={notice.id} sx={{ border: notice.priority === 'high' ? '2px solid #f44336' : 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getPriorityIcon(notice.priority)}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {notice.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={notice.priority}
                    color={getPriorityColor(notice.priority) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {notice.message}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    From: {notice.createdBy}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CustomerNotices;