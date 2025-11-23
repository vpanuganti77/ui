import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class CleanNotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('⚠️ Not on native platform, skipping FCM');
      return;
    }

    console.log('🚀 Starting FCM initialization...');
    
    // Request permissions
    const pushPerm = await PushNotifications.requestPermissions();
    const localPerm = await LocalNotifications.requestPermissions();
    
    console.log('📋 Push permission:', pushPerm.receive);
    
    if (pushPerm.receive === 'granted') {
      console.log('🔄 Registering for FCM...');
      // Register for FCM (Capacitor handles FCM automatically)
      await PushNotifications.register();
      
      // Listen for FCM token
      PushNotifications.addListener('registration', (token) => {
        console.log('✅ FCM Token registered:', token.value.substring(0, 20) + '...');
        this.saveTokenToBackend(token.value);
      });
      
      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ FCM registration error:', error);
      });
      
      // Listen for push notifications (let FCM handle display)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification);
        // Don't show additional notification - FCM handles display automatically
      });
      
      // Listen for notification taps
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Notification tapped:', notification);
        this.handleNotificationTap(notification.notification.data);
      });
    }
  }

  static async showLocalNotification(title: string, body: string) {
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Math.floor(Math.random() * 1000000),
        schedule: { at: new Date(Date.now() + 100) }
      }]
    });
  }

  static async saveTokenToBackend(token: string) {
    console.log('💾 Attempting to save FCM token...');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 User data:', { id: user.id, role: user.role, hostelId: user.hostelId });
    
    if (!user.id) {
      console.error('❌ No user ID found, cannot save FCM token');
      return;
    }

    try {
      const payload = {
        userId: user.id,
        token,
        platform: 'android',
        userRole: user.role,
        hostelId: user.hostelId || 'master_admin'
      };
      
      console.log('📤 Sending FCM token payload:', payload);
      
      const response = await fetch('https://hostelmanagementbackend-production.up.railway.app/api/notifications/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('✅ FCM token saved to backend for user:', user.role);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save FCM token:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Failed to save FCM token:', error);
    }
  }

  static handleNotificationTap(data: any) {
    console.log('👆 Handling notification tap:', data);
    
    // Navigate based on notification type
    if (data.route) {
      window.location.href = data.route;
    } else {
      // Fallback navigation based on type
      switch (data.type) {
        case 'complaint':
        case 'complaint_update':
        case 'complaint_comment':
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role === 'tenant') {
            window.location.href = '/tenant/complaints';
          } else {
            window.location.href = '/admin/complaints';
          }
          break;
        case 'new_notice':
          window.location.href = user.role === 'tenant' ? '/tenant/notices' : '/admin/notices';
          break;
        case 'hostel_request':
          window.location.href = '/master-admin/requests';
          break;
        default:
          console.log('No specific route for notification type:', data.type);
      }
    }
  }
}