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
    
    // Check users from fileDataService
    const users = await getAll('users');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user && user.status === 'active') {
      return {
        token: 'token-' + user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          hostelId: user.hostelId,
          hostelName: user.hostelName,
          isActive: user.status === 'active'
        }
      };
    }
    
    throw new Error('Invalid credentials');
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