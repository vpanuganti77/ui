import { User } from '../types';
import { getAll, create } from './fileDataService';
import { CapacitorHttpService } from './capacitorHttpService';
import { Capacitor } from '@capacitor/core';
import { API_CONFIG } from '../config/api';

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
    const apiUrl = API_CONFIG.BASE_URL;
    
    const response = Capacitor.isNativePlatform() 
      ? await CapacitorHttpService.post(`${apiUrl}/auth/login`, { email, password })
      : await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log('Login failed response:', data); // Debug log
      
      // Handle specific error cases with proper messages
      if (data.message) {
        if (data.message.includes('Account is deactivated') || data.message.includes('inactive')) {
          const error = new Error('Your account has been deactivated. Please contact support for assistance.');
          (error as any).status = response.status;
          throw error;
        }
        if (data.message.includes('Hostel is deactivated')) {
          const error = new Error('Your hostel has been deactivated. Please contact support for assistance.');
          (error as any).status = response.status;
          throw error;
        }
        if (data.message.includes('User not found') || data.message.includes('Invalid credentials')) {
          const error = new Error('Invalid email or password. Please check your credentials.');
          (error as any).status = response.status;
          throw error;
        }
      }
      
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
        status: data.user.status,
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
    // Keep session data for quick re-login unless explicitly cleared
    // localStorage.removeItem('rememberedEmail');
    // localStorage.removeItem('rememberedPassword');
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
    // Set session timestamp for persistent login
    localStorage.setItem('sessionTimestamp', Date.now().toString());
  },

  // Check if session is still valid (disabled for persistent login)
  isSessionValid(): boolean {
    // Always return true for persistent login
    return true;
  },

  // Extend session on activity (disabled for persistent login)
  extendSession() {
    // No-op for persistent login
  },

  // Clear all auth data including persistent session
  clearAllAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionTimestamp');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  }
};