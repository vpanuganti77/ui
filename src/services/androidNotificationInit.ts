import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class AndroidNotificationInit {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Request permissions on app start
      const permission = await LocalNotifications.requestPermissions();
      console.log('Android notification permissions:', permission);

      // Listen for notification actions
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed:', notification);
      });

      return permission.display === 'granted';
    } catch (error) {
      console.error('Android notification init error:', error);
      return false;
    }
  }
}