const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

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
}

// API helper function
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Generic CRUD operations with multi-tenant filtering
export const getAll = async (entityType: keyof DataStructure): Promise<any[]> => {
  const data = await apiCall(`/${entityType}`);
  
  // Apply multi-tenant filtering for admin users
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'admin' && user.hostelId) {
        // Filter data by hostelId for admin users
        const entitiesWithHostelId = ['rooms', 'tenants', 'payments', 'complaints', 'expenses', 'staff'];
        if (entitiesWithHostelId.includes(entityType)) {
          return data.filter((item: any) => item.hostelId === user.hostelId);
        }
        // For users, show only users from same hostel
        if (entityType === 'users') {
          return data.filter((item: any) => item.hostelId === user.hostelId || item.id === user.id);
        }
        // For hostels, show only current user's hostel
        if (entityType === 'hostels') {
          return data.filter((item: any) => item.id === user.hostelId);
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  // Return all data if no user or not admin (for master admin or when user is deleted)
  return data;
};

export const create = async (entityType: keyof DataStructure, item: any): Promise<any> => {
  const newItem = {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await apiCall(`/${entityType}`, {
    method: 'POST',
    body: JSON.stringify(newItem),
  });
};

export const update = async (entityType: keyof DataStructure, id: string, updates: any): Promise<any> => {
  const updatedItem = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return await apiCall(`/${entityType}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedItem),
  });
};

export const remove = async (entityType: keyof DataStructure, id: string): Promise<void> => {
  await apiCall(`/${entityType}/${id}`, {
    method: 'DELETE',
  });
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
    hostelRequests: await getAll('hostelRequests')
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
    'hostels', 'tenants', 'rooms', 'payments', 'complaints', 
    'users', 'expenses', 'staff', 'hostelRequests'
  ];
  
  for (const entityType of entityTypes) {
    const items = await getAll(entityType);
    for (const item of items) {
      await remove(entityType, item.id);
    }
  }
};