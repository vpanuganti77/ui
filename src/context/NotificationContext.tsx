import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'complaint' | 'complaint_update' | 'payment' | 'hostelRequest' | 'general' | 'test';
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

  // Initialize notifications on mount
  const initializeNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const refreshNotifications = useCallback(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

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
            type: notification.type as 'complaint' | 'complaint_update' | 'payment' | 'hostelRequest' | 'general',
            priority: notification.priority as 'low' | 'medium' | 'high',
            isRead: false,
            createdAt: notification.createdAt,
            targetRole: user.role,
            hostelId: user.hostelId
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
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