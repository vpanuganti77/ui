import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class SimpleNotificationService {
  static async testNotification() {
    console.log('🔔 Testing notification...');
    
    if (Capacitor.isNativePlatform()) {
      // Android - Use Capacitor Local Notifications
      try {
        const permission = await LocalNotifications.requestPermissions();
        console.log('Permission result:', permission);
        
        if (permission.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [{
              title: 'HostelPro Test',
              body: 'This notification works on Android! 🎉',
              id: 1,
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
          console.log('✅ Android notification scheduled');
          return true;
        } else {
          console.log('❌ Permission denied');
          return false;
        }
      } catch (error) {
        console.error('Android notification error:', error);
        return false;
      }
    } else {
      // Web - Simple browser notification
      if (Notification.permission === 'granted') {
        new Notification('HostelPro Test', {
          body: 'This notification works in browser! 🎉'
        });
        return true;
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('HostelPro Test', {
            body: 'This notification works in browser! 🎉'
          });
          return true;
        }
      }
      alert('Browser notification test - this would be a notification');
      return false;
    }
  }

  static async complaintNotification(id: string, status: string) {
    console.log(`🔔 Complaint ${id} notification: ${status}`);
    
    if (Capacitor.isNativePlatform()) {
      try {
        // Request permissions first
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
          console.log('❌ No notification permission');
          return;
        }
        
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Complaint Updated',
            body: `Complaint #${id} is now ${status}`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default',
            attachments: [],
            actionTypeId: '',
            extra: {}
          }]
        });
        console.log('✅ Complaint notification sent');
      } catch (error) {
        console.error('Complaint notification error:', error);
      }
    } else {
      if (Notification.permission === 'granted') {
        new Notification('Complaint Updated', {
          body: `Complaint #${id} is now ${status}`
        });
      } else {
        alert(`Complaint #${id} is now ${status}`);
      }
    }
  }
}
