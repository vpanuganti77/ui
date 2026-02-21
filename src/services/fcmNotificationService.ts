import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class FCMNotificationService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    console.log('❌ FCMNotificationService disabled to prevent duplicates');
    return;
  }

  private static async sendTokenToServer(token: string): Promise<void> {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ 
        API_BASE_URL: 'https://hostelmanagementbackend-production.up.railway.app/api' 
      }));
      
      await fetch(`${config.API_BASE_URL}/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: user.id,
          userRole: user.role,
          hostelId: user.hostelId
        })
      });
      
      console.log('FCM token sent to server');
    } catch (error) {
      console.error('Failed to send FCM token:', error);
    }
  }

  private static async showForegroundNotification(title: string, body: string): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [{
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default'
          }]
        });
      }
    } catch (error) {
      console.error('Failed to show foreground notification:', error);
    }
  }
}
