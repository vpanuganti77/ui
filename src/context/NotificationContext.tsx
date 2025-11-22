import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { NotificationService } from '../services/notificationService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'complaint' | 'complaint_update' | 'payment' | 'hostelRequest' | 'hostel_request' | 'general' | 'test' | 'hostel_approved' | 'hostel_status_change';
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
  forceRefresh: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

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

  const refreshNotifications = useCallback(async () => {
    try {
      // Load notifications from database for current user
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        try {
          const { getAll } = await import('../services/fileDataService');
          const allNotifications = await getAll('notifications');
          
          // Filter notifications for current user
          const userNotifications = allNotifications
            .filter((n: any) => n.userId === user.id)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 50); // Keep last 50 notifications
          
          setNotifications(userNotifications);
          setUnreadCount(userNotifications.filter((n: any) => !n.isRead).length);
          
          // Also save to localStorage for offline access
          saveNotifications(userNotifications);
        } catch (apiError: any) {
          // If notifications API doesn't exist (404), fall back to localStorage
          if (apiError.message?.includes('404') || apiError.message?.includes('Not Found')) {
            console.warn('Notifications API not available, using localStorage');
            loadStoredNotifications();
          } else {
            throw apiError;
          }
        }
      } else {
        // Fallback to localStorage if no user
        loadStoredNotifications();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to localStorage
      loadStoredNotifications();
    }
  }, [loadStoredNotifications, saveNotifications]);

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
    refreshNotifications();
    
    // Listen for notification refresh events
    const handleNotificationRefresh = () => {
      refreshNotifications();
    };
    
    // Auto-refresh data when app regains focus after receiving notifications
    const handleWindowFocus = () => {
      if (hasNewNotifications) {
        setHasNewNotifications(false);
        // Trigger data refresh instead of full page reload
        window.dispatchEvent(new CustomEvent('refreshData'));
      }
    };
    
    window.addEventListener('notificationRefresh', handleNotificationRefresh);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('notificationRefresh', handleNotificationRefresh);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loadStoredNotifications, refreshNotifications, hasNewNotifications]);

  // Connect to WebSocket for real-time notifications
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Connect to WebSocket for real-time notifications when app is open
        socketService.connect(user);
        
        // Initialize FCM for Android or web notifications
        const { Capacitor } = require('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          // Use FCM for Android (industry standard)
          import('../services/fcmNotificationService').then(({ FCMNotificationService }) => {
            FCMNotificationService.initialize();
          });
        } else {
          // Use web notifications for browser
          NotificationService.initializeMobile(user);
        }
        
        socketService.onNotification((notification) => {
          console.log('NotificationContext: Received notification:', notification);
          
          // Create unique ID to prevent duplicates
          const uniqueId = `${notification.type}-${notification.title}-${notification.message}-${Date.now()}`;
          
          const newNotification: Notification = {
            id: uniqueId,
            title: notification.title,
            message: notification.message,
            type: notification.type as 'complaint' | 'complaint_update' | 'payment' | 'hostelRequest' | 'hostel_request' | 'general' | 'test' | 'hostel_approved' | 'hostel_status_change',
            priority: notification.priority as 'low' | 'medium' | 'high',
            isRead: false,
            createdAt: notification.createdAt,
            targetRole: user.role,
            hostelId: user.hostelId
          };
          
          // Android notifications are handled by FCM automatically
          // No manual notification needed - FCM handles background/foreground
          
          console.log('NotificationContext: Created notification object:', newNotification);
          console.log('NotificationContext: Notification type check:', notification.type, '=== hostel_approved?', notification.type === 'hostel_approved');
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev.slice(0, 49)]; // Keep last 50 notifications
            console.log('NotificationContext: Updated notifications array:', updated.length);
            saveNotifications(updated);
            return updated;
          });
          
          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log('NotificationContext: Updated unread count:', newCount);
            return newCount;
          });
          
          setHasNewNotifications(true);
          
          // Don't show browser notification here - NotificationService handles this
          // to prevent duplicates
          
          // Handle hostel approval - auto-login to get updated user data with hostelId
          console.log('NotificationContext: Checking if hostel_approved:', notification.type);
          if (notification.type === 'hostel_approved') {
            console.log('NotificationContext: Hostel approved, performing auto-login');
            (async () => {
              try {
                const response = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: user.email,
                    password: user.password
                  })
                });
                
                if (response.ok) {
                  const loginData = await response.json();
                  localStorage.setItem('user', JSON.stringify(loginData.user));
                  console.log('Auto-login successful with hostelId:', loginData.user.hostelId);
                  
                  // Reload page to refresh with new session
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } else {
                  console.error('Auto-login failed after hostel approval');
                  // Fallback: just refresh the page
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              } catch (error) {
                console.error('Auto-login error:', error);
                // Fallback: just refresh the page
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            })();
          }
          
          // Immediately refresh UI for hostel status changes
          if (notification.type === 'hostel_status_change') {
            console.log('NotificationContext: Triggering dashboard refresh for hostel status change');
            window.dispatchEvent(new CustomEvent('dashboardRefresh'));
            window.dispatchEvent(new CustomEvent('refreshData'));
            // Note: Page reload is handled by SocketService dialog for hostel_status_change
          }
          
          // Trigger notification refresh event
          window.dispatchEvent(new CustomEvent('notificationRefresh'));
          
          console.log('NotificationContext: Notification processing complete');
          
          // Notifications are handled by NotificationService to prevent duplicates
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
      refreshNotifications,
      forceRefresh
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationProvider');
  }
  return context;
};

// Keep the old export for backward compatibility
export const useNotifications = useNotificationsContext;