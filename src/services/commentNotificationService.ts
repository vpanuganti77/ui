import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class CommentNotificationService {
  static async notifyNewComment(complaintId: string, commenterName: string) {
    console.log(`🔔 New comment on complaint ${complaintId} by ${commenterName}`);
    
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [{
            title: 'New Comment Added',
            body: `${commenterName} commented on complaint #${complaintId}`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default'
          }]
        });
        console.log('✅ Comment notification sent');
      } catch (error) {
        console.error('❌ Comment notification error:', error);
      }
    } else {
      if (Notification.permission === 'granted') {
        new Notification('New Comment Added', {
          body: `${commenterName} commented on complaint #${complaintId}`
        });
      }
    }
  }
}
