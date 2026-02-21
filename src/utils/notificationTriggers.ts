import { NotificationService } from '../features/notifications/services/notificationService';

export const triggerNotifications = {
  // Complaint notifications
  onComplaintCreated: (complaint: any) => {
    NotificationService.notifyComplaintUpdate(
      complaint.id, 
      'submitted', 
      complaint.hostelId, 
      complaint.tenantId
    );
  },

  onComplaintStatusChanged: (complaint: any, oldStatus: string) => {
    NotificationService.notifyComplaintUpdate(
      complaint.id, 
      complaint.status, 
      complaint.hostelId, 
      complaint.tenantId
    );
  },

  // Payment notifications
  onPaymentDue: (tenant: any, amount: number, dueDate: string) => {
    NotificationService.notifyPaymentDue(
      tenant.id, 
      amount, 
      dueDate, 
      tenant.hostelId
    );
  },

  onPaymentOverdue: (tenant: any, amount: number, daysPastDue: number) => {
    NotificationService.notifyPaymentDue(
      tenant.id, 
      amount, 
      `${daysPastDue} days overdue`, 
      tenant.hostelId
    );
  },

  // Maintenance notifications
  onMaintenanceScheduled: (rooms: string[], date: string, hostelId: string) => {
    NotificationService.notifyMaintenanceScheduled(rooms, date, hostelId);
  },

  // Visitor notifications
  onVisitorArrival: (tenantId: string, visitorName: string, hostelId: string) => {
    NotificationService.notifyVisitorArrival(tenantId, visitorName, hostelId);
  },

  // Emergency notifications
  onEmergencyAlert: (message: string, hostelId: string) => {
    NotificationService.notifyEmergency(message, hostelId);
  },

  // Booking notifications
  onBookingConfirmed: (booking: any) => {
    NotificationService.notifyBookingConfirmed(
      booking.tenantId, 
      booking.roomNumber, 
      booking.checkInDate, 
      booking.hostelId
    );
  },

  // Announcement notifications
  onNewAnnouncement: (title: string, message: string, hostelId: string, targetRole?: string) => {
    NotificationService.notifyAnnouncement(title, message, hostelId, targetRole);
  }
};
