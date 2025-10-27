import { API_CONFIG } from '../config/api';
import { NotificationService } from './notificationService';

export class HostelStatusService {
  private static checkInterval: NodeJS.Timeout | null = null;
  private static lastKnownStatus: string | null = null;
  private static lastKnownUserStatus: string | null = null;

  // Start monitoring hostel status for admin/receptionist users
  static startMonitoring(user: any): void {
    if (!user || user.role === 'master_admin' || user.role === 'tenant') {
      return;
    }

    // Clear any existing interval
    this.stopMonitoring();

    // Check status every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkHostelStatus(user);
      this.checkUserStatus(user);
    }, 30000);

    // Initial check
    this.checkHostelStatus(user);
    this.checkUserStatus(user);
  }

  // Stop monitoring
  static stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.lastKnownStatus = null;
    this.lastKnownUserStatus = null;
  }

  // Check hostel status and notify if changed
  private static async checkHostelStatus(user: any): Promise<void> {
    try {
      if (!user.hostelId) return;
      
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

  // Check user status and notify if changed
  private static async checkUserStatus(user: any): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users`);
      if (!response.ok) return;

      const users = await response.json();
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (!currentUser) return;

      const currentUserStatus = currentUser.status;

      // If this is the first check, just store the status
      if (this.lastKnownUserStatus === null) {
        this.lastKnownUserStatus = currentUserStatus;
        return;
      }

      // Check if user status changed from pending_approval to active
      if (this.lastKnownUserStatus === 'pending_approval' && currentUserStatus === 'active') {
        this.handleUserApprovalChange(currentUser);
        this.lastKnownUserStatus = currentUserStatus;
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  }

  // Handle status change and send notification
  private static handleStatusChange(oldStatus: string, newStatus: string, hostelName: string): void {
    if (newStatus === 'inactive' || newStatus === 'deactivated') {
      NotificationService.showHostelDeactivatedNotification(hostelName);
      // Trigger dashboard refresh immediately
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      // Force page reload after a short delay to show restricted access
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (newStatus === 'active' && (oldStatus === 'inactive' || oldStatus === 'deactivated')) {
      NotificationService.showHostelReactivatedNotification(hostelName);
      // Trigger dashboard refresh immediately
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      // Force page reload after a short delay to restore access
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  // Handle user approval status change
  private static handleUserApprovalChange(user: any): void {
    NotificationService.showHostelApprovedNotification(user.hostelName || 'Your Hostel');
    
    // Update local storage immediately
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...storedUser, status: 'active', isActive: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Trigger dashboard refresh immediately
    window.dispatchEvent(new CustomEvent('dashboardRefresh'));
    
    // Force page reload after a short delay to show main dashboard
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
}