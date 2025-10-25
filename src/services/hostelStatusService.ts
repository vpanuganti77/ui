import { API_CONFIG } from '../config/api';
import { NotificationService } from './notificationService';

export class HostelStatusService {
  private static checkInterval: NodeJS.Timeout | null = null;
  private static lastKnownStatus: string | null = null;

  // Start monitoring hostel status for admin/receptionist users
  static startMonitoring(user: any): void {
    // Temporarily disabled to prevent API calls
    return;
  }

  // Stop monitoring
  static stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.lastKnownStatus = null;
  }

  // Check hostel status and notify if changed
  private static async checkHostelStatus(user: any): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/hostels/${user.hostelId}`);
      if (!response.ok) return;

      const hostel = await response.json();
      const currentStatus = hostel.status;

      // If this is the first check, just store the status
      if (this.lastKnownStatus === null) {
        this.lastKnownStatus = currentStatus;
        return;
      }

      // Check if status changed
      if (this.lastKnownStatus !== currentStatus) {
        this.handleStatusChange(this.lastKnownStatus, currentStatus, hostel.name);
        this.lastKnownStatus = currentStatus;
      }
    } catch (error) {
      console.error('Error checking hostel status:', error);
    }
  }

  // Handle status change and send notification
  private static handleStatusChange(oldStatus: string, newStatus: string, hostelName: string): void {
    if (newStatus === 'inactive' || newStatus === 'deactivated') {
      NotificationService.showHostelDeactivatedNotification(hostelName);
      // Force page reload after a short delay to show restricted access
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (newStatus === 'active' && (oldStatus === 'inactive' || oldStatus === 'deactivated')) {
      NotificationService.showHostelReactivatedNotification(hostelName);
      // Force page reload after a short delay to restore access
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
}