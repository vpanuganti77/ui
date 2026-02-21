import { getAll } from './storage/fileDataService';

export interface AvailabilityResult {
  isAvailable: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const availabilityService = {
  async checkNameAvailability(name: string, excludeId?: string): Promise<AvailabilityResult> {
    if (!name || name.trim().length < 2) {
      return {
        isAvailable: false,
        message: 'Name must be at least 2 characters',
        type: 'error'
      };
    }

    try {
      const tenants = await getAll('tenants');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const existingTenant = tenants.find((tenant: any) => 
        tenant.hostelId === user.hostelId &&
        tenant.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        tenant.id !== excludeId
      );

      if (existingTenant) {
        return {
          isAvailable: false,
          message: 'Name already exists',
          type: 'error'
        };
      }

      return {
        isAvailable: true,
        message: 'Name is available',
        type: 'success'
      };
    } catch (error) {
      return {
        isAvailable: false,
        message: 'Error checking availability',
        type: 'error'
      };
    }
  },

  async checkEmailAvailability(email: string, excludeId?: string): Promise<AvailabilityResult> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        isAvailable: false,
        message: 'Invalid email format',
        type: 'error'
      };
    }

    try {
      const tenants = await getAll('tenants');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const existingTenant = tenants.find((tenant: any) => 
        tenant.hostelId === user.hostelId &&
        tenant.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        tenant.id !== excludeId
      );

      if (existingTenant) {
        return {
          isAvailable: false,
          message: 'Email already exists',
          type: 'error'
        };
      }

      return {
        isAvailable: true,
        message: 'Email is available',
        type: 'success'
      };
    } catch (error) {
      return {
        isAvailable: false,
        message: 'Error checking availability',
        type: 'error'
      };
    }
  },

  async checkPhoneAvailability(phone: string, excludeId?: string): Promise<AvailabilityResult> {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone || cleanPhone.length !== 10) {
      return {
        isAvailable: false,
        message: 'Invalid phone number',
        type: 'error'
      };
    }

    try {
      const tenants = await getAll('tenants');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const existingTenant = tenants.find((tenant: any) => 
        tenant.hostelId === user.hostelId &&
        tenant.phone.replace(/\D/g, '') === cleanPhone &&
        tenant.id !== excludeId
      );

      if (existingTenant) {
        return {
          isAvailable: false,
          message: 'Phone number already exists',
          type: 'error'
        };
      }

      return {
        isAvailable: true,
        message: 'Phone number is available',
        type: 'success'
      };
    } catch (error) {
      return {
        isAvailable: false,
        message: 'Error checking availability',
        type: 'error'
      };
    }
  }
};