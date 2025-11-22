import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener, NotificationData } from '../services/fcmService';

interface NotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: NotificationData;
}

export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    const initFCM = async () => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setToken(fcmToken);
        localStorage.setItem('fcmToken', fcmToken);
      }
    };

    initFCM();

    onMessageListener().then((payload: any) => {
      setLastNotification(payload);
      
      const options: NotificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data.type,
        requireInteraction: payload.data.priority === 'critical',
        vibrate: getVibrationPattern(payload.data.priority),
        actions: getNotificationActions(payload.data.type)
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(payload.notification.title, options);
        });
      } else {
        new Notification(payload.notification.title, options);
      }
    });
  }, []);

  return { token, lastNotification };
};

const getVibrationPattern = (priority: string): number[] => {
  switch (priority) {
    case 'critical': return [200, 100, 200, 100, 200];
    case 'high': return [200, 100, 200];
    case 'medium': return [200];
    default: return [];
  }
};

const getNotificationActions = (type: string): NotificationAction[] => {
  switch (type) {
    case 'complaint':
      return [{ action: 'view', title: 'View' }, { action: 'dismiss', title: 'Dismiss' }];
    case 'payment':
      return [{ action: 'pay', title: 'Pay Now' }, { action: 'remind', title: 'Remind Later' }];
    case 'visitor':
      return [{ action: 'approve', title: 'Approve' }, { action: 'deny', title: 'Deny' }];
    case 'emergency':
      return [{ action: 'acknowledge', title: 'Acknowledge' }];
    default:
      return [{ action: 'view', title: 'View' }];
  }
};