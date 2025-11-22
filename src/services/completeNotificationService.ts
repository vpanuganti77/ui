import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class CompleteNotificationService {
  static async sendNotification(title: string, body: string) {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [{
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default'
          }]
        });
        console.log('✅ Notification sent:', title);
      } catch (error) {
        console.error('❌ Notification error:', error);
      }
    } else {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }

  static async newComplaint(complaintId: string, title: string, tenantName: string) {
    await this.sendNotification(
      'New Complaint Submitted',
      `${tenantName} submitted: "${title}" (#${complaintId})`
    );
  }

  static async statusChanged(complaintId: string, oldStatus: string, newStatus: string) {
    await this.sendNotification(
      'Complaint Status Updated',
      `Complaint #${complaintId} changed from ${oldStatus} to ${newStatus}`
    );
  }

  static async newComment(complaintId: string, commenterName: string) {
    await this.sendNotification(
      'New Comment Added',
      `${commenterName} commented on complaint #${complaintId}`
    );
  }
}