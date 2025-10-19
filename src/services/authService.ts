import { User } from '../types';
import { getAll, create } from './fileDataService';

// Master admin user (always available)
const MASTER_ADMIN = {
  id: 'master_admin_1',
  name: 'Master Admin',
  email: 'master@hostel.com',
  phone: '9999999999',
  role: 'master_admin' as const,
  hostelName: 'System Administrator',
  isActive: true,
  password: 'master123'
};

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    // Check master admin first
    if (email === MASTER_ADMIN.email && password === MASTER_ADMIN.password) {
      return {
        token: 'token-' + MASTER_ADMIN.id,
        user: MASTER_ADMIN
      };
    }
    
    // Use the new login API endpoint
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || 'Login failed');
      (error as any).status = response.status;
      (error as any).isLocked = data.isLocked;
      (error as any).attemptsRemaining = data.attemptsRemaining;
      throw error;
    }
    
    return {
      token: 'token-' + data.user.id,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        hostelId: data.user.hostelId,
        hostelName: data.user.hostelName,
        isActive: data.user.status === 'active'
      }
    };
  },



  async getProfile(): Promise<User> {
    const user = this.getStoredUser();
    if (!user) {
      throw new Error('No user found');
    }
    return user;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  storeAuth(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};