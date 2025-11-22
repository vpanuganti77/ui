import { sendNotificationToUsers, sendNotificationToRole, NotificationData, NotificationType } from './fcmService';

export class NotificationService {
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static showNotification(title: string, body: string, options?: NotificationOptions): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/icon-192x192.png', ...options });
  }

  static async initializeMobile(user: any): Promise<void> {
    if (this.isSupported()) {
      await this.requestPermission();
    }
    
    // Update FCM token for new user (handles user switching on same device)
    try {
      const { FCMTokenService } = await import('./fcmTokenService');
      await FCMTokenService.updateTokenForNewUser();
    } catch (error) {
      console.error('Failed to update FCM token for new user:', error);
    }
  }

  static async sendPushNotification(role: string, title: string, message: string, type: string): Promise<void> {
    await sendNotificationToRole(role, 'all', title, message, {
      type: type as NotificationType,
      entityId: `${type}_${Date.now()}`,
      hostelId: 'all',
      priority: 'medium'
    });
  }

  static showHostelDeactivatedNotification(hostelName: string): void {
    this.showNotification('Hostel Deactivated', `${hostelName} has been deactivated`);
  }

  static showHostelReactivatedNotification(hostelName: string): void {
    this.showNotification('Hostel Reactivated', `${hostelName} is now active`);
  }

  static showHostelApprovedNotification(hostelName: string): void {
    this.showNotification('Hostel Approved', `${hostelName} has been approved`);
  }

  static async notifyComplaintUpdate(complaintId: string, status: string, hostelId: string, tenantId: string) {
    const data: NotificationData = {
      type: 'complaint',
      entityId: complaintId,
      hostelId,
      userId: tenantId,
      priority: status === 'resolved' ? 'medium' : 'high',
      action: 'view_complaint'
    };

    await Promise.all([
      sendNotificationToUsers([tenantId], 'Complaint Updated', `Your complaint status: ${status}`, data),
      sendNotificationToRole('admin', hostelId, 'Complaint Updated', `Complaint #${complaintId} is ${status}`, data)
    ]);
  }

  static async notifyPaymentDue(tenantId: string, amount: number, dueDate: string, hostelId: string) {
    const data: NotificationData = {
      type: 'payment',
      entityId: tenantId,
      hostelId,
      userId: tenantId,
      priority: 'high',
      action: 'pay_now'
    };

    await sendNotificationToUsers([tenantId], 'Payment Due', `₹${amount} due by ${dueDate}`, data);
  }

  static async notifyMaintenanceScheduled(roomNumbers: string[], date: string, hostelId: string) {
    const data: NotificationData = {
      type: 'maintenance',
      entityId: `maintenance_${Date.now()}`,
      hostelId,
      priority: 'medium',
      action: 'view_schedule'
    };

    await sendNotificationToRole('tenant', hostelId, 'Maintenance Scheduled', 
      `Rooms ${roomNumbers.join(', ')} on ${date}`, data);
  }

  static async notifyAnnouncement(title: string, message: string, hostelId: string, targetRole?: string) {
    const data: NotificationData = {
      type: 'announcement',
      entityId: `announcement_${Date.now()}`,
      hostelId,
      priority: 'medium',
      action: 'view_announcement'
    };

    await sendNotificationToRole(targetRole || 'all', hostelId, title, message, data);
  }

  static async notifyVisitorArrival(tenantId: string, visitorName: string, hostelId: string) {
    const data: NotificationData = {
      type: 'visitor',
      entityId: `visitor_${Date.now()}`,
      hostelId,
      userId: tenantId,
      priority: 'medium',
      action: 'approve_visitor'
    };

    await Promise.all([
      sendNotificationToUsers([tenantId], 'Visitor Arrived', `${visitorName} is waiting`, data),
      sendNotificationToRole('security', hostelId, 'Visitor Check-in', `${visitorName} for tenant`, data)
    ]);
  }

  static async notifyEmergency(message: string, hostelId: string) {
    const data: NotificationData = {
      type: 'emergency',
      entityId: `emergency_${Date.now()}`,
      hostelId,
      priority: 'critical',
      action: 'emergency_action'
    };

    await sendNotificationToRole('all', hostelId, '🚨 EMERGENCY', message, data);
  }

  static async notifyBookingConfirmed(tenantId: string, roomNumber: string, checkIn: string, hostelId: string) {
    const data: NotificationData = {
      type: 'booking',
      entityId: `booking_${Date.now()}`,
      hostelId,
      userId: tenantId,
      priority: 'high',
      action: 'view_booking'
    };

    await sendNotificationToUsers([tenantId], 'Booking Confirmed', 
      `Room ${roomNumber} from ${checkIn}`, data);
  }
}