import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '../services/fcmService';
import { NotificationService } from '../services/notificationService';

interface NotificationContextType {
  token: string | null;
  notifyComplaintUpdate: typeof NotificationService.notifyComplaintUpdate;
  notifyPaymentDue: typeof NotificationService.notifyPaymentDue;
  notifyMaintenanceScheduled: typeof NotificationService.notifyMaintenanceScheduled;
  notifyAnnouncement: typeof NotificationService.notifyAnnouncement;
  notifyVisitorArrival: typeof NotificationService.notifyVisitorArrival;
  notifyEmergency: typeof NotificationService.notifyEmergency;
  notifyBookingConfirmed: typeof NotificationService.notifyBookingConfirmed;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initFCM = async () => {
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          setToken(fcmToken);
          localStorage.setItem('fcmToken', fcmToken);
        }
      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    initFCM();

    onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        const options: NotificationOptions = {
          body: payload.notification.body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: payload.data?.type || 'default'
        };

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(payload.notification.title, options);
          });
        } else {
          new Notification(payload.notification.title, options);
        }
      }
    }).catch(console.error);
  }, []);

  const value: NotificationContextType = {
    token,
    notifyComplaintUpdate: NotificationService.notifyComplaintUpdate,
    notifyPaymentDue: NotificationService.notifyPaymentDue,
    notifyMaintenanceScheduled: NotificationService.notifyMaintenanceScheduled,
    notifyAnnouncement: NotificationService.notifyAnnouncement,
    notifyVisitorArrival: NotificationService.notifyVisitorArrival,
    notifyEmergency: NotificationService.notifyEmergency,
    notifyBookingConfirmed: NotificationService.notifyBookingConfirmed,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
