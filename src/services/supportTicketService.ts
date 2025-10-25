import { API_CONFIG } from '../config/api';
import { NotificationService } from './notificationService';

export class SupportTicketService {
  // Send notification when support ticket is created
  static async notifyTicketCreated(ticketData: any): Promise<void> {
    try {
      // Notify master admin about new support ticket
      await NotificationService.sendPushNotification(
        'master_admin',
        'New Support Ticket',
        `${ticketData.submittedBy} submitted: "${ticketData.subject}"`,
        'support_ticket'
      );
    } catch (error) {
      console.error('Failed to send ticket creation notification:', error);
    }
  }

  // Send notification when support ticket is resolved
  static async notifyTicketResolved(ticketData: any, originalSubmitter: any): Promise<void> {
    try {
      // Notify the original ticket submitter
      if (originalSubmitter && originalSubmitter.id) {
        await fetch(`${API_CONFIG.BASE_URL}/push-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: originalSubmitter.id,
            title: 'Support Ticket Resolved',
            message: `Your support ticket "${ticketData.subject}" has been resolved.`,
            type: 'ticket_resolved'
          })
        });
      }
    } catch (error) {
      console.error('Failed to send ticket resolution notification:', error);
    }
  }

  // Handle ticket status update
  static async handleTicketStatusUpdate(ticketId: string, oldStatus: string, newStatus: string): Promise<void> {
    if (oldStatus !== 'resolved' && newStatus === 'resolved') {
      try {
        // Get ticket details
        const ticketResponse = await fetch(`${API_CONFIG.BASE_URL}/supportTickets/${ticketId}`);
        if (!ticketResponse.ok) return;
        
        const ticket = await ticketResponse.json();
        
        // Get original submitter details
        const userResponse = await fetch(`${API_CONFIG.BASE_URL}/users/${ticket.submittedById}`);
        if (!userResponse.ok) return;
        
        const submitter = await userResponse.json();
        
        // Send notification
        await this.notifyTicketResolved(ticket, submitter);
      } catch (error) {
        console.error('Failed to handle ticket status update:', error);
      }
    }
  }
}