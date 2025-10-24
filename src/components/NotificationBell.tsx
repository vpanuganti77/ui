import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  ReportProblem,
  Payment,
  Business,
  Circle
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type and user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    switch (notification.type) {
      case 'complaint':
        navigate(user.role === 'master_admin' ? '/master-admin/dashboard' : '/admin/complaints');
        break;
      case 'payment':
        navigate('/admin/payments');
        break;
      case 'hostelRequest':
        navigate('/master-admin/requests');
        break;
      default:
        break;
    }
    
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint':
      case 'complaint_update':
        return <ReportProblem color="error" fontSize="small" />;
      case 'payment':
        return <Payment color="warning" fontSize="small" />;
      case 'hostelRequest':
        return <Business color="primary" fontSize="small" />;
      default:
        return <Circle color="info" fontSize="small" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          mr: isMobile ? 0.5 : 1,
          p: isMobile ? 1 : 1.5
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? 
            <Notifications sx={{ fontSize: isMobile ? 20 : 24 }} /> : 
            <NotificationsNone sx={{ fontSize: isMobile ? 20 : 24 }} />
          }
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            width: isMobile ? '90vw' : 400, 
            maxWidth: isMobile ? 350 : 400,
            maxHeight: isMobile ? '70vh' : 500
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography color="text.secondary">No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected'
                },
                alignItems: 'flex-start',
                py: 1.5,
                minHeight: 'auto'
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold', flex: 1, pr: 1 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 0.5,
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        textOverflow: 'unset'
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={getPriorityColor(notification.priority) as any}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
              />
              {!notification.isRead && (
                <Circle color="primary" sx={{ fontSize: 8, ml: 1 }} />
              )}
            </MenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <Divider />
            <MenuItem onClick={handleClose}>
              <Typography color="primary" sx={{ textAlign: 'center', width: '100%' }}>
                View all notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;