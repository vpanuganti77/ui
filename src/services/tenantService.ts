import api from './api';
import { Complaint, Payment } from '../types';

export const tenantService = {
  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    const response = await api.get('/tenant/complaints');
    return response.data.complaints;
  },

  async createComplaint(complaintData: {
    title: string;
    description: string;
    category: string;
    priority?: string;
  }): Promise<Complaint> {
    const response = await api.post('/tenant/complaints', complaintData);
    return response.data.complaint;
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
    return response.data;
  }
};