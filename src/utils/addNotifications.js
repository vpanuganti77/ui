// Quick integration examples for other pages

// In Payments page - add to payment update function:
import { triggerNotifications } from '../utils/notificationTriggers';

// When payment is due:
triggerNotifications.onPaymentDue(tenant, amount, dueDate);

// In Maintenance page - when scheduling:
triggerNotifications.onMaintenanceScheduled(['101', '102'], '2024-01-15', hostelId);

// In Visitors page - when visitor arrives:
triggerNotifications.onVisitorArrival(tenantId, 'John Doe', hostelId);

// For emergency alerts:
triggerNotifications.onEmergencyAlert('Fire drill at 3 PM', hostelId);

// For announcements:
triggerNotifications.onNewAnnouncement('New WiFi Password', 'Password: hostel123', hostelId);