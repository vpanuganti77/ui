import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class CapacitorNotificationService {
  private static isInitialized = false;

  // Initialize push notifications
  static async initialize(): Promise<void> {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      console.log('🚀 Initializing Capacitor push notifications...');
      
      // Create notification channel first (Android requirement)
      await this.createNotificationChannel();
      
      // Request permissions for both push and local notifications
      const pushPermStatus = await PushNotifications.requestPermissions();
      const localPermStatus = await LocalNotifications.requestPermissions();
      
      console.log('📋 Push Permission:', pushPermStatus);
      console.log('📋 Local Permission:', localPermStatus);
      
      if (pushPermStatus.receive === 'granted') {
        // Register with FCM
        await PushNotifications.register();
        console.log('FCM registration initiated...');
        
        // Listen for registration token
        PushNotifications.addListener('registration', (token) => {
          console.log('✅ Push registration success, token: ' + token.value);
          this.sendTokenToServer(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('❌ Error on registration: ' + JSON.stringify(error));
        });

        // Listen for push notifications (foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📱 Push notification received (foreground): ', notification);
          
          // Use LocalNotifications to show notification in foreground
          this.showLocalNotification(
            notification.title || 'PGFlow Notification', 
            notification.body || 'You have a new notification'
          );
          
          // Trigger data refresh for complaint notifications
          if (notification.data?.type === 'complaint' || notification.data?.type === 'complaint_update') {
            window.dispatchEvent(new CustomEvent('refreshData'));
            window.dispatchEvent(new CustomEvent('notificationRefresh'));
          }
        });

        // Listen for notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('👆 Push notification action performed', notification.actionId, notification.inputValue);
        });

        this.isInitialized = true;
        console.log('✅ Capacitor push notifications initialized');
      } else {
        console.log('❌ Push notification permission denied');
      }
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  // Create notification channel for Android
  static async createNotificationChannel(): Promise<void> {
    try {
      await LocalNotifications.createChannel({
        id: 'pgflow_notifications',
        name: 'PGFlow Notifications',
        description: 'Notifications for PGFlow app',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#FF0000'
      });
      console.log('✅ Notification channel created');
    } catch (error) {
      console.error('❌ Error creating notification channel:', error);
    }
  }

  // Send FCM token to your backend
  private static async sendTokenToServer(token: string): Promise<void> {
    try {
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ 
        API_BASE_URL: 'https://hostelmanagementbackend-production.up.railway.app/api' 
      }));
      const apiBaseUrl = config.API_BASE_URL || 'https://hostelmanagementbackend-production.up.railway.app/api';

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await fetch(`${apiBaseUrl}/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: user.id,
          userRole: user.role,
          hostelId: user.hostelId,
          platform: 'android'
        })
      });
      
      console.log('FCM token sent to server');
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Show foreground notification
  static async showForegroundNotification(title: string, body: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // For web, use browser notification
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/icon-192.png'
        });
      }
      return;
    }

    try {
      // Create notification channel for Android first
      await PushNotifications.createChannel({
        id: 'pgflow-notifications',
        name: 'PGFlow Notifications',
        description: 'Notifications for PGFlow app',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true
      });

      // Use PushNotifications to show notification
      await PushNotifications.register();
      
      // Create a manual notification using the service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'pgflow-notification',
          requireInteraction: false,
          silent: false
        });
        console.log('Service worker notification shown:', { title, body });
      } else {
        console.log('Service worker not available, notification logged only');
      }
    } catch (error) {
      console.error('Error showing foreground notification:', error);
    }
  }

  // WORKING ANDROID SOLUTION - Uses LocalNotifications like the test button
  static async showLocalNotification(title: string, body: string): Promise<void> {
    console.log('🔔 Real notification called:', { title, body });
    
    if (!Capacitor.isNativePlatform()) {
      // Web - use browser notifications
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
      return;
    }
    
    // ANDROID - Use the SAME method as working Direct Plugin Test
    try {
      console.log('📱 Using LocalNotifications for Android...');
      
      // Request LocalNotifications permissions (the working approach)
      const localPermResult = await LocalNotifications.requestPermissions();
      console.log('📋 LocalNotifications permission:', localPermResult);
      
      if (localPermResult.display === 'granted') {
        // Schedule immediate notification using LocalNotifications
        await LocalNotifications.schedule({
          notifications: [
            {
              title: title,
              body: body,
              id: Math.floor(Math.random() * 1000000),
              schedule: { at: new Date(Date.now() + 100) }, // Immediate
              sound: 'default',
              attachments: [],
              actionTypeId: '',
              extra: { source: 'real-notification' }
            }
          ]
        });
        
        console.log('✅ Real Android notification scheduled successfully!');
      } else {
        console.log('❌ LocalNotifications permission denied');
        // Fallback alert
        alert(`🔔 ${title}\n\n${body}`);
      }
      
    } catch (error) {
      console.error('❌ Real notification error:', error);
      // Guaranteed fallback
      alert(`🔔 NOTIFICATION\n\n${title}\n${body}`);
    }
  }
  


  // Check if running on native platform
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }
}