import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Only initialize Firebase web SDK on web platform
let app: any = null;
let messaging: any = null;

if (!Capacitor.isNativePlatform()) {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export type NotificationType = 'complaint' | 'payment' | 'maintenance' | 'announcement' | 'booking' | 'visitor' | 'emergency';

export interface NotificationData {
  type: NotificationType;
  entityId: string;
  hostelId: string;
  userId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
}

export const requestNotificationPermission = async (): Promise<string | null> => {
  // Skip Firebase web SDK on native platforms
  if (Capacitor.isNativePlatform()) {
    console.log('Native platform detected, skipping Firebase web SDK');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && messaging) {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      if (token) {
        await saveTokenToServer(token);
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error('FCM token error:', error);
    return null;
  }
};

const saveTokenToServer = async (token: string) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) {
    try {
      await fetch('/api/fcm/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          token, 
          hostelId: user.hostelId,
          userType: user.role 
        })
      });
    } catch (error) {
      console.error('Save token error:', error);
    }
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (Capacitor.isNativePlatform() || !messaging) {
      console.log('Native platform or no messaging, skipping web FCM listener');
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export const sendNotificationToUsers = async (
  userIds: string[], 
  title: string, 
  body: string, 
  data: NotificationData
) => {
  try {
    const response = await fetch('/api/fcm/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, title, body, data })
    });
    return response.ok;
  } catch (error) {
    console.error('Send notification error:', error);
    return false;
  }
};

export const sendNotificationToRole = async (
  role: string, 
  hostelId: string, 
  title: string, 
  body: string, 
  data: NotificationData
) => {
  try {
    const response = await fetch('/api/fcm/send-to-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, hostelId, title, body, data })
    });
    return response.ok;
  } catch (error) {
    console.error('Send notification error:', error);
    return false;
  }
};