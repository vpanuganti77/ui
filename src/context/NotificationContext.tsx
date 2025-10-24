import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { NotificationService } from '../services/notificationService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'complaint' | 'complaint_update' | 'payment' | 'hostelRequest' | 'general' | 'test' | 'hostel_approved' | 'hostel_status_change';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  targetRole?: string;
  hostelId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage
  const loadStoredNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((notifications: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    loadStoredNotifications();
  }, [loadStoredNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      );
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(0);
  }, [saveNotifications]);

  // Load stored notifications on mount
  useEffect(() => {
    loadStoredNotifications();
  }, [loadStoredNotifications]);

  // Connect to WebSocket for real-time notifications
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        socketService.connect(user);
        
        socketService.onNotification((notification) => {
          const newNotification: Notification = {
            id: `${notification.type}-${Date.now()}`,
            title: notification.title,
            message: notification.message,
            type: notification.type as 'complaint' | 'complaint_update' | 'payment' | 'hostelRequest' | 'general' | 'hostel_approved' | 'hostel_status_change',
            priority: notification.priority as 'low' | 'medium' | 'high',
            isRead: false,
            createdAt: notification.createdAt,
            targetRole: user.role,
            hostelId: user.hostelId
          };
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev.slice(0, 49)]; // Keep last 50 notifications
            saveNotifications(updated);
            return updated;
          });
          setUnreadCount(prev => prev + 1);
          
          // Show mobile notification
          NotificationService.showNotification(
            notification.title,
            notification.message
          );
        });
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    }
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};