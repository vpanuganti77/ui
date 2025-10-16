import api from './api';
import { DashboardStats, Tenant, Room, Payment, Complaint, PaginatedResponse } from '../types';
import { getAll as fileGetAll } from './fileDataService';

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
    return response.data.stats;
  },

  async getMonthlyRevenue(year?: number): Promise<any[]> {
    const response = await api.get(`/admin/dashboard/revenue${year ? `?year=${year}` : ''}`);
    return response.data.monthlyRevenue;
  },

  // Tenants
  async getTenants(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Tenant>> {
    const response = await api.get('/admin/tenants', { params });
    return response.data;
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
    return response.data.tenant;
  },

  async updateTenant(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put(`/admin/tenants/${id}`, tenantData);
    return response.data.tenant;
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
    const response = await api.get('/admin/rooms', { params });
    return response.data;
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
    return response.data.room;
  },

  async updateRoom(id: string, roomData: Partial<Room>): Promise<Room> {
    const response = await api.put(`/admin/rooms/${id}`, roomData);
    return response.data.room;
  },

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/admin/rooms/${id}`);
  },

  async getRoomStats(): Promise<any[]> {
    const response = await api.get('/admin/rooms/stats');
    return response.data.stats;
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
    const response = await api.get('/admin/payments', { params });
    return response.data;
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
    return response.data.payment;
  },

  async generateMonthlyBills(month: string): Promise<void> {
    await api.post('/admin/payments/generate-bills', { month });
  },

  async getPaymentStats(year?: number): Promise<any[]> {
    const response = await api.get(`/admin/payments/stats${year ? `?year=${year}` : ''}`);
    return response.data.stats;
  },

  // Complaints
  async getComplaints(params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Complaint>> {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  async updateComplaint(id: string, complaintData: {
    status?: string;
    adminNotes?: string;
    assignedTo?: string;
    priority?: string;
  }): Promise<Complaint> {
    const response = await api.put(`/admin/complaints/${id}`, complaintData);
    return response.data.complaint;
  },

  async getComplaintStats(): Promise<any> {
    const response = await api.get('/admin/complaints/stats');
    return response.data;
  },

  // User Management
  async getAllUsers(): Promise<any> {
    const response = await api.get('/admin/users');
    return response;
  },

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<any> {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  async resetUserPassword(userId: string): Promise<any> {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  async updateUser(userId: string, userData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: string;
  }): Promise<any> {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: string): Promise<any> {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUserStatus(userId: string, status: string): Promise<any> {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // Expense management
  async getAllExpenses(): Promise<any> {
    const response = await api.get('/admin/expenses');
    return response.data;
  },

  async createExpense(expenseData: any): Promise<any> {
    const response = await api.post('/admin/expenses', expenseData);
    return response.data;
  },

  async updateExpense(expenseId: string, expenseData: any): Promise<any> {
    const response = await api.put(`/admin/expenses/${expenseId}`, expenseData);
    return response.data;
  },

  async deleteExpense(expenseId: string): Promise<any> {
    const response = await api.delete(`/admin/expenses/${expenseId}`);
    return response.data;
  },

  async getExpenseStats(): Promise<any> {
    const response = await api.get('/admin/expenses/stats');
    return response.data;
  }
};