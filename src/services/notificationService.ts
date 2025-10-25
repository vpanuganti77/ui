// Mobile notification service
export class NotificationService {
  private static vapidPublicKey = 'BFgRKVi9ta3rYS9-EgATV6OsyqoTclh9e9LDfeZARRk4w7yj1GGeWqmWaMj2oLbPYpBN8eTBc9m2_Oo1pkmXZZA';

  // Check if notifications are supported
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  static async subscribeToPush(userId: string, userRole: string, hostelId?: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api'}/push-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userId,
          userRole,
          hostelId
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Show local notification
  static showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hostel-notification',
        requireInteraction: true // Keep notification visible until user interacts
      });
    }
  }

  // Show hostel deactivation notification
  static showHostelDeactivatedNotification(hostelName: string): void {
    this.showNotification(
      '🚫 Hostel Deactivated',
      `Your hostel "${hostelName}" has been deactivated. Please contact support to restore access.`,
      '/favicon.ico'
    );
  }

  // Show hostel reactivation notification
  static showHostelReactivatedNotification(hostelName: string): void {
    this.showNotification(
      '✅ Hostel Reactivated',
      `Great news! Your hostel "${hostelName}" has been reactivated. You can now access all features.`,
      '/favicon.ico'
    );
  }

  // Show new support ticket notification (for master admin)
  static showNewSupportTicketNotification(subject: string, submittedBy: string): void {
    this.showNotification(
      '🎫 New Support Ticket',
      `${submittedBy} submitted: "${subject}"`,
      '/favicon.ico'
    );
  }

  // Show support ticket resolved notification (for ticket creator)
  static showSupportTicketResolvedNotification(subject: string): void {
    this.showNotification(
      '✅ Support Ticket Resolved',
      `Your support ticket "${subject}" has been resolved.`,
      '/favicon.ico'
    );
  }

  // Send push notification to backend for specific roles
  static async sendPushNotification(targetRole: string, title: string, message: string, type: string): Promise<void> {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api'}/push-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          title,
          message,
          type
        })
      });
    } catch (error) {
      console.warn('Push notification failed:', error);
    }
  }

  // Initialize notifications for mobile
  static async initializeMobile(user: any): Promise<void> {
    if (!this.isSupported()) return;

    // Auto-request permission and subscribe to push notifications
    if (Notification.permission === 'default') {
      const granted = await this.requestPermission();
      if (granted) {
        await this.subscribeToPush(user.id, user.role, user.hostelId);
      }
    } else if (Notification.permission === 'granted') {
      // Already granted, just subscribe
      await this.subscribeToPush(user.id, user.role, user.hostelId);
    }
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}