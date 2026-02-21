import api from '../shared/services/api/api';
import { DashboardStats, Tenant, Room, Payment, Complaint, PaginatedResponse } from '../types';
import { getAll as fileGetAll } from '../shared/services/storage/fileDataService';

export const adminService = {
  // Generic data fetching
  async getAll(entityType: string): Promise<any[]> {
    try {
      return await fileGetAll(entityType as any);
    } catch (error) {
      console.error(`Error fetching ${entityType}:`, error);
      return [];
    }
  },
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    const data = await response.json();
    return data.stats;
  },

  async getMonthlyRevenue(year?: number): Promise<any[]> {
    const response = await api.get(`/admin/dashboard/revenue${year ? `?year=${year}` : ''}`);
    const data = await response.json();
    return data.monthlyRevenue;
  },

  // Tenants
  async getTenants(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Tenant>> {
    const response = await api.get('/admin/tenants');
    const data = await response.json();
    return data;
  },

  async createTenant(tenantData: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    roomId: string;
    rent: number;
    deposit: number;
    joiningDate: string;
  }): Promise<Tenant> {
    const response = await api.post('/admin/tenants', tenantData);
    const data = await response.json();
    return data.tenant;
  },

  async updateTenant(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put(`/admin/tenants/${id}`, tenantData);
    const data = await response.json();
    return data.tenant;
  },

  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/admin/tenants/${id}`);
  },

  // Rooms
  async getRooms(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Room>> {
    const response = await api.get('/admin/rooms');
    const data = await response.json();
    return data;
  },

  async createRoom(roomData: {
    roomNumber: string;
    type: string;
    capacity: number;
    rent: number;
    floor?: number;
    amenities?: string[];
  }): Promise<Room> {
    const response = await api.post('/admin/rooms', roomData);
    const data = await response.json();
    return data.room;
  },

  async updateRoom(id: string, roomData: Partial<Room>): Promise<Room> {
    const response = await api.put(`/admin/rooms/${id}`, roomData);
    const data = await response.json();
    return data.room;
  },

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/admin/rooms/${id}`);
  },

  async getRoomStats(): Promise<any[]> {
    const response = await api.get('/admin/rooms/stats');
    const data = await response.json();
    return data.stats;
  },

  // Payments
  async getPayments(params?: {
    tenantId?: string;
    month?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await api.get('/admin/payments');
    const data = await response.json();
    return data;
  },

  async createPayment(paymentData: {
    tenantId: string;
    amount: number;
    type: string;
    month: string;
    dueDate: string;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
  }): Promise<Payment> {
    const response = await api.post('/admin/payments', paymentData);
    const data = await response.json();
    return data.payment;
  },

  async generateMonthlyBills(month: string): Promise<void> {
    await api.post('/admin/payments/generate-bills', { month });
  },

  async getPaymentStats(year?: number): Promise<any[]> {
    const response = await api.get(`/admin/payments/stats${year ? `?year=${year}` : ''}`);
    const data = await response.json();
    return data.stats;
  },

  // Complaints
  async getComplaints(params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Complaint>> {
    const response = await api.get('/admin/complaints');
    const data = await response.json();
    return data;
  },

  async updateComplaint(id: string, complaintData: {
    status?: string;
    adminNotes?: string;
    assignedTo?: string;
    priority?: string;
  }): Promise<Complaint> {
    const response = await api.put(`/admin/complaints/${id}`, complaintData);
    const data = await response.json();
    return data.complaint;
  },

  async getComplaintStats(): Promise<any> {
    const response = await api.get('/admin/complaints/stats');
    const data = await response.json();
    return data;
  },

  // User Management
  async getAllUsers(): Promise<any> {
    const response = await api.get('/admin/users');
    const data = await response.json();
    return data;
  },

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<any> {
    const response = await api.post('/admin/users', userData);
    const data = await response.json();
    return data;
  },

  async resetUserPassword(userId: string): Promise<any> {
    const response = await api.post(`/admin/users/${userId}/reset-password`, {});
    const data = await response.json();
    return data;
  },

  async updateUser(userId: string, userData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: string;
  }): Promise<any> {
    const response = await api.put(`/admin/users/${userId}`, userData);
    const data = await response.json();
    return data;
  },

  async deleteUser(userId: string): Promise<any> {
    const response = await api.delete(`/admin/users/${userId}`);
    const data = await response.json();
    return data;
  },

  async updateUserStatus(userId: string, status: string): Promise<any> {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    const data = await response.json();
    return data;
  },

  // Expense management
  async getAllExpenses(): Promise<any> {
    const response = await api.get('/admin/expenses');
    const data = await response.json();
    return data;
  },

  async createExpense(expenseData: any): Promise<any> {
    const response = await api.post('/admin/expenses', expenseData);
    const data = await response.json();
    return data;
  },

  async updateExpense(expenseId: string, expenseData: any): Promise<any> {
    const response = await api.put(`/admin/expenses/${expenseId}`, expenseData);
    const data = await response.json();
    return data;
  },

  async deleteExpense(expenseId: string): Promise<any> {
    const response = await api.delete(`/admin/expenses/${expenseId}`);
    const data = await response.json();
    return data;
  },

  async getExpenseStats(): Promise<any> {
    const response = await api.get('/admin/expenses/stats');
    const data = await response.json();
    return data;
  }
};
