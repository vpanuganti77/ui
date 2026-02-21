import { API_CONFIG } from '../../../config/api';
import { CapacitorHttpService } from '../../../services/capacitorHttpService';
import { Capacitor } from '@capacitor/core';

interface DataStructure {
  hostels: any[];
  tenants: any[];
  rooms: any[];
  payments: any[];
  complaints: any[];
  users: any[];
  expenses: any[];
  staff: any[];
  hostelRequests: any[];
  notices: any[];
  checkoutRequests: any[];
  hostelSettings: any[];
  notifications: any[];
  supportTickets: any[];
}

// API helper function
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  let response;
  
  if (Capacitor.isNativePlatform()) {
    // Use CapacitorHttp for Android
    response = await CapacitorHttpService.request(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body
    });
  } else {
    // Use regular fetch for web
    response = await fetch(url, {
      headers,
      ...options,
    });
  }
  
  if (!response.ok) {
    let errorMessage = response.statusText || 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || response.statusText;
    } catch (e) {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Generic CRUD operations with multi-tenant filtering
export const getAll = async (entityType: keyof DataStructure): Promise<any[]> => {
  try {
    const data = await apiCall(`/${entityType}`);
    
    // Apply multi-tenant filtering for admin users
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log(`Filtering ${entityType} for user:`, user);
        
        // Only apply filtering for regular admin users, not master admin
        if (user.role === 'admin' && user.hostelId) {
          // Filter data by hostelId for admin users
          const entitiesWithHostelId = ['rooms', 'tenants', 'payments', 'complaints', 'expenses', 'staff', 'notices'];
          if (entitiesWithHostelId.includes(entityType)) {
            const filtered = data.filter((item: any) => item.hostelId === user.hostelId);
            return filtered;
          }
          // For users, show only users from same hostel
          if (entityType === 'users') {
            const filtered = data.filter((item: any) => item.hostelId === user.hostelId || item.id === user.id);
            return filtered;
          }
          // For hostels, show only current user's hostel
          if (entityType === 'hostels') {
            const filtered = data.filter((item: any) => item.id === user.hostelId);
            return filtered;
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Return all data if no user or not admin (for master admin or when user is deleted)
    return data;
  } catch (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw error;
  }
};

export const create = async (entityType: keyof DataStructure, item: any): Promise<any> => {
  const userData = localStorage.getItem('user');
  let hostelId = null;
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      hostelId = user.hostelId;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  const newItem = {
    ...item,
    // Auto-assign hostelId for entities that need it
    ...(hostelId && ['rooms', 'tenants', 'payments', 'complaints', 'expenses', 'staff', 'notices'].includes(entityType) && !item.hostelId ? { hostelId } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Handle file uploads for complaints
    if (entityType === 'complaints' && item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0) {
      const formData = new FormData();
      
      // Add all non-file fields
      Object.keys(newItem).forEach(key => {
        if (key !== 'attachments' && newItem[key] !== undefined) {
          formData.append(key, newItem[key]);
        }
      });
      
      // Add files
      item.attachments.forEach((file: File, index: number) => {
        formData.append(`attachments`, file);
      });
      
      let response;
      
      if (Capacitor.isNativePlatform()) {
        // For file uploads on Android, we need to handle differently
        // For now, fallback to regular fetch for file uploads
        response = await fetch(`${API_CONFIG.BASE_URL}/${entityType}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${API_CONFIG.BASE_URL}/${entityType}`, {
          method: 'POST',
          body: formData,
        });
      }
      
      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || response.statusText;
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } else {
      const result = await apiCall(`/${entityType}`, {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      
      return result;
    }
  } catch (error: any) {
    // Handle backend validation errors
    if (error.message.includes('already exists')) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const update = async (entityType: keyof DataStructure, id: string, updates: any): Promise<any> => {
  const updatedItem = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  try {
    const result = await apiCall(`/${entityType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedItem),
    });
    
    return result;
  } catch (error: any) {
    // Handle backend validation errors
    if (error.message.includes('already exists')) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const remove = async (entityType: keyof DataStructure, id: string, masterAdminCleanup = false): Promise<void> => {
  try {
    const url = masterAdminCleanup ? `/${entityType}/${id}?masterAdminCleanup=true` : `/${entityType}/${id}`;
    await apiCall(url, {
      method: 'DELETE',
    });
  } catch (error: any) {
    // Re-throw the specific error message from backend
    throw new Error(error.message || `Failed to delete ${entityType}`);
  }
};

export const getById = async (entityType: keyof DataStructure, id: string): Promise<any> => {
  const items = await getAll(entityType);
  const item = items.find((item: any) => item.id === id);
  
  if (!item) {
    throw new Error(`${entityType} with id ${id} not found`);
  }
  
  return item;
};

// Data management functions
export const exportData = async (): Promise<string> => {
  const data: DataStructure = {
    hostels: await getAll('hostels'),
    tenants: await getAll('tenants'),
    rooms: await getAll('rooms'),
    payments: await getAll('payments'),
    complaints: await getAll('complaints'),
    users: await getAll('users'),
    expenses: await getAll('expenses'),
    staff: await getAll('staff'),
    hostelRequests: await getAll('hostelRequests'),
    notices: await getAll('notices'),
    checkoutRequests: await getAll('checkoutRequests'),
    hostelSettings: await getAll('hostelSettings'),
    notifications: await getAll('notifications'),
    supportTickets: await getAll('supportTickets')
  };
  return JSON.stringify(data, null, 2);
};

export const importData = async (jsonData: string): Promise<void> => {
  const data = JSON.parse(jsonData);
  
  // Clear existing data and import new data
  for (const entityType of Object.keys(data) as (keyof DataStructure)[]) {
    const existingItems = await getAll(entityType);
    
    // Remove existing items
    for (const item of existingItems) {
      await remove(entityType, item.id);
    }
    
    // Add new items
    for (const item of data[entityType]) {
      await create(entityType, item);
    }
  }
};

export const clearAllData = async (): Promise<void> => {
  const entityTypes: (keyof DataStructure)[] = [
    'notifications', 'checkoutRequests', 'notices', 'complaints',
    'payments', 'expenses', 'tenants', 'rooms', 'staff',
    'hostelRequests', 'hostels', 'users', 'hostelSettings'
  ];
  
  const errors: string[] = [];
  
  for (const entityType of entityTypes) {
    try {
      const items = await getAll(entityType);
      for (const item of items) {
        try {
          await remove(entityType, item.id, true);
        } catch (error: any) {
          console.warn(`Failed to delete ${entityType} ${item.id}:`, error.message);
          errors.push(`${entityType}: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.warn(`Failed to get ${entityType}:`, error.message);
      errors.push(`Get ${entityType}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('Some items could not be deleted:', errors);
    // Don't throw error, just log warnings
  }
};
