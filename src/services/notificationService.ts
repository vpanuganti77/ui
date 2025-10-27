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
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready for push subscription');
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        console.log('New push subscription created:', subscription);
      } else {
        console.log('Using existing push subscription:', subscription);
      }

      // Get API base URL from config
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ API_BASE_URL: 'https://api-production-79b8.up.railway.app/api' }));
      const apiBaseUrl = config.API_BASE_URL || 'https://api-production-79b8.up.railway.app/api';

      // Send subscription to server
      const response = await fetch(`${apiBaseUrl}/push-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userId,
          userRole,
          hostelId
        })
      });

      if (response.ok) {
        console.log('Push subscription sent to server successfully');
        return true;
      } else {
        console.error('Failed to send push subscription to server:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Show local notification
  static showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hostel-notification',
        requireInteraction: true // Keep notification visible until user interacts
      });
      
      // Handle notification click to focus app
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Trigger notification refresh and dashboard refresh
        window.dispatchEvent(new CustomEvent('notificationRefresh'));
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      };
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

  // Show hostel approval notification
  static showHostelApprovedNotification(hostelName: string): void {
    this.showNotification(
      '🎉 Hostel Approved!',
      `Your hostel "${hostelName}" has been approved and is now active. You can now access all features.`,
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

  // Show new hostel request notification (for master admin)
  static showNewHostelRequestNotification(hostelName: string, requesterName: string): void {
    this.showNotification(
      '🏢 New Hostel Setup Request',
      `${requesterName} has requested to setup ${hostelName}. Please review and approve.`,
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
      const config = await fetch('/config.json').then(r => r.json()).catch(() => ({ API_BASE_URL: 'https://api-production-79b8.up.railway.app/api' }));
      const apiBaseUrl = config.API_BASE_URL || 'https://api-production-79b8.up.railway.app/api';
      
      await fetch(`${apiBaseUrl}/push-notification`, {
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

  // Test push notification (for debugging)
  static async testPushNotification(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          console.log('Testing push notification...');
          // Show a local notification to test
          registration.showNotification('Test Notification', {
            body: 'This is a test push notification',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'test-notification',
            requireInteraction: true
          });
        } else {
          console.log('No push subscription found');
        }
      } catch (error) {
        console.error('Test notification failed:', error);
      }
    }
  }

  // Send push notification to specific user by email
  static async sendPushNotificationToUser(targetEmail: string, title: string, message: string, type: string): Promise<void> {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api-production-79b8.up.railway.app/api'}/push-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail,
          title,
          message,
          type
        })
      });
    } catch (error) {
      console.warn('Push notification failed for user:', targetEmail, error);
    }
  }

  // Initialize notifications for mobile
  static async initializeMobile(user: any): Promise<void> {
    if (!this.isSupported()) {
      console.log('Push notifications not supported on this device');
      return;
    }

    console.log('Initializing mobile notifications for user:', user.id);

    // Auto-request permission and subscribe to push notifications
    if (Notification.permission === 'default') {
      console.log('Requesting notification permission...');
      const granted = await this.requestPermission();
      if (granted) {
        console.log('Permission granted, subscribing to push notifications...');
        await this.subscribeToPush(user.id, user.role, user.hostelId);
      } else {
        console.log('Notification permission denied');
      }
    } else if (Notification.permission === 'granted') {
      console.log('Permission already granted, subscribing to push notifications...');
      // Already granted, just subscribe
      await this.subscribeToPush(user.id, user.role, user.hostelId);
    } else {
      console.log('Notification permission denied or blocked');
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