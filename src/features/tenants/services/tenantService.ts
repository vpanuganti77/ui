import api from '../../../shared/services/api/api';
import { Complaint, Payment } from '../../../types';

export const tenantService = {
  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    const response = await api.get('/tenant/complaints');
    const data = await response.json();
    return data.complaints;
  },

  async createComplaint(complaintData: {
    title: string;
    description: string;
    category: string;
    priority?: string;
  }): Promise<Complaint> {
    const response = await api.post('/tenant/complaints', complaintData);
    const data = await response.json();
    return data.complaint;
  },

  // Payments
  async getPayments(): Promise<{
    payments: Payment[];
    pendingAmount: number;
    tenantInfo: {
      rent: number;
      deposit: number;
      pendingDues: number;
    };
  }> {
    const response = await api.get('/tenant/payments');
    const data = await response.json();
    return data;
  }
};
