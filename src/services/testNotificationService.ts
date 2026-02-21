import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class TestNotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, using web notifications');
      return;
    }

    try {
      // Request permissions
      const permission = await LocalNotifications.requestPermissions();
      console.log('Notification permission:', permission);
      
      if (permission.display === 'granted') {
        console.log('✅ Notification permissions granted');
        return true;
      } else {
        console.log('❌ Notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  static async showTestNotification() {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from HostelPro',
          icon: '/icon-192x192.png'
        });
      } else {
        alert('Test notification: This would be a notification on Android');
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: 'HostelPro Test',
          body: 'Notifications are working! 🎉',
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: { test: true }
        }]
      });
      console.log('✅ Test notification scheduled');
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  static async showComplaintNotification(complaintId: string, status: string) {
    if (!Capacitor.isNativePlatform()) {
      alert(`Complaint #${complaintId} status: ${status}`);
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Complaint Updated',
          body: `Complaint #${complaintId} is now ${status}`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: { type: 'complaint', id: complaintId }
        }]
      });
      console.log('✅ Complaint notification sent');
    } catch (error) {
      console.error('❌ Error sending complaint notification:', error);
    }
  }
}
