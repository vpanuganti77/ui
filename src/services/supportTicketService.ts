import { API_CONFIG } from '../config/api';
import { NotificationService } from '../features/notifications/services/notificationService';
import { CapacitorHttpService } from './capacitorHttpService';
import { Capacitor } from '@capacitor/core';

export class SupportTicketService {
  // Send notification when support ticket is created
  static async notifyTicketCreated(ticketData: any): Promise<void> {
    try {
      // Notify master admin about new support ticket
      await NotificationService.notifyAnnouncement(
        'New Support Ticket',
        `${ticketData.submittedBy} submitted: "${ticketData.subject}"`,
        ticketData.hostelId || 'all',
        'master_admin'
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
        if (Capacitor.isNativePlatform()) {
          await CapacitorHttpService.post(`${API_CONFIG.BASE_URL}/push-notification`, {
            targetUserId: originalSubmitter.id,
            title: 'Support Ticket Resolved',
            message: `Your support ticket "${ticketData.subject}" has been resolved.`,
            type: 'ticket_resolved'
          });
        } else {
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
        const ticketResponse = Capacitor.isNativePlatform()
          ? await CapacitorHttpService.get(`${API_CONFIG.BASE_URL}/supportTickets/${ticketId}`)
          : await fetch(`${API_CONFIG.BASE_URL}/supportTickets/${ticketId}`);
        if (!ticketResponse.ok) return;
        
        const ticket = await ticketResponse.json();
        
        // Get original submitter details
        const userResponse = Capacitor.isNativePlatform()
          ? await CapacitorHttpService.get(`${API_CONFIG.BASE_URL}/users/${ticket.submittedById}`)
          : await fetch(`${API_CONFIG.BASE_URL}/users/${ticket.submittedById}`);
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
