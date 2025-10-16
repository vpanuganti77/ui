import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Chip
} from '@mui/material';
import { Notifications, Business, Person } from '@mui/icons-material';
import { getAll } from '../services/fileDataService';

const NotificationMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [requests, hostels] = await Promise.all([
        getAll('hostelRequests'),
        getAll('hostels')
      ]);

      const pendingRequests = requests.filter((req: any) => req.status === 'pending');
      const notificationList = pendingRequests.map((req: any) => ({
        id: req.id,
        type: 'hostel_request',
        title: 'New Hostel Request',
        message: `${req.ownerName} requested to add ${req.hostelName}`,
        timestamp: req.createdAt
      }));

      setNotifications(notificationList);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography color="text.secondary">No new notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleClose}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Business color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                </Box>
                <Chip label="New" size="small" color="primary" />
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;