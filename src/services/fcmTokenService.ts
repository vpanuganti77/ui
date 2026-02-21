import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

export class FCMTokenService {
  static async initializeAndSaveToken() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping FCM token registration');
      return;
    }

    try {
      // Request permissions
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        console.log('❌ Push notification permission denied');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', async (token) => {
        console.log('✅ FCM Token received:', token.value);
        await this.saveTokenToServer(token.value);
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📱 Push notification received:', notification);
      });

      // Listen for notification tap
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Push notification tapped:', notification);
        this.handleNotificationTap(notification.notification.data);
      });

    } catch (error) {
      console.error('❌ FCM initialization error:', error);
    }
  }

  static async saveTokenToServer(token: string) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        console.log('❌ No user found, cannot save FCM token');
        return;
      }

      const response = await axios.post('/api/notifications/save-token', {
        userId: user.id,
        token,
        hostelId: user.hostelId,
        userType: user.role
      });

      if (response.data.success) {
        console.log('✅ FCM token saved to server');
        localStorage.setItem('fcmTokenSaved', 'true');
      }
    } catch (error) {
      console.error('❌ Failed to save FCM token:', error);
    }
  }

  static async updateTokenForNewUser() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Get current FCM token
      const registration = await PushNotifications.getDeliveredNotifications();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        console.log('❌ No user found, cannot update FCM token');
        return;
      }

      // Update token with new user information
      const response = await axios.post('/api/notifications/update-token', {
        userId: user.id,
        hostelId: user.hostelId,
        userType: user.role
      });

      if (response.data.success) {
        console.log('✅ FCM token updated for new user');
      }
    } catch (error) {
      console.error('❌ Failed to update FCM token for new user:', error);
    }
  }

  static handleNotificationTap(data: any) {
    console.log('🔔 Handling notification tap:', data);
    
    switch (data.type) {
      case 'complaint':
        window.location.href = `/admin/complaints?id=${data.complaintId}`;
        break;
      case 'comment':
        window.location.href = `/admin/complaints?id=${data.complaintId}&openComments=true`;
        break;
      case 'status_change':
        window.location.href = `/tenant/complaints?id=${data.complaintId}`;
        break;
      default:
        window.location.href = '/';
    }
  }

  static async sendComplaintNotification(complaintId: string, title: string, tenantName: string, hostelId: string) {
    try {
      await axios.post('/api/notifications/complaint-created', {
        complaintId,
        title,
        tenantName,
        hostelId
      });
      console.log('✅ Complaint notification sent');
    } catch (error) {
      console.error('❌ Failed to send complaint notification:', error);
    }
  }

  static async sendCommentNotification(complaintId: string, commenterName: string, hostelId: string) {
    try {
      await axios.post('/api/notifications/comment-added', {
        complaintId,
        commenterName,
        hostelId
      });
      console.log('✅ Comment notification sent');
    } catch (error) {
      console.error('❌ Failed to send comment notification:', error);
    }
  }

  static async sendStatusChangeNotification(complaintId: string, oldStatus: string, newStatus: string, hostelId: string, tenantId: string) {
    try {
      await axios.post('/api/notifications/status-changed', {
        complaintId,
        oldStatus,
        newStatus,
        hostelId,
        tenantId
      });
      console.log('✅ Status change notification sent');
    } catch (error) {
      console.error('❌ Failed to send status change notification:', error);
    }
  }
}
