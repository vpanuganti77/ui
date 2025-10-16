// Demo Data Service - Persists data in localStorage for demo purposes
// This simulates a database without requiring actual backend storage

interface DemoData {
  hostels: any[];
  tenants: any[];
  rooms: any[];
  payments: any[];
  complaints: any[];
  users: any[];
  expenses: any[];
  staff: any[];
}

const STORAGE_KEY = 'hostelPro_demo_data';

// Initial demo data
const initialData: DemoData = {
  hostels: [
    {
      id: '1',
      name: 'Green Valley Hostel',
      address: '123 Main Street, Mumbai, Maharashtra',
      planType: 'premium',
      planStatus: 'active',
      features: ['tenant_management', 'room_management', 'payment_tracking', 'complaint_system', 'staff_management', 'reports_analytics', 'sms_notifications'],
      adminName: 'Rajesh Kumar',
      adminEmail: 'admin@greenvalley.com',
      adminPhone: '9876543210',
      status: 'active',
      createdAt: '2024-01-15',
      totalRooms: 25,
      occupiedRooms: 18
    },
    {
      id: '2',
      name: 'City Center Hostel',
      address: '456 Park Avenue, Delhi',
      planType: 'standard',
      planStatus: 'trial',
      features: ['tenant_management', 'room_management', 'payment_tracking', 'complaint_system'],
      adminName: 'Priya Sharma',
      adminEmail: 'admin@citycenter.com',
      adminPhone: '9876543211',
      status: 'pending',
      createdAt: '2024-02-01',
      totalRooms: 30,
      occupiedRooms: 0
    }
  ],
  tenants: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      roomId: 'R001',
      rent: 8000,
      deposit: 16000,
      joiningDate: '2024-01-15',
      status: 'active'
    }
  ],
  rooms: [
    {
      id: 'R001',
      roomNumber: 'R001',
      capacity: '2',
      rent: 8000,
      floor: 1,
      amenities: 'WiFi, AC, Attached Bathroom',
      status: 'occupied'
    }
  ],
  payments: [],
  complaints: [],
  users: [],
  expenses: [],
  staff: []
};

class DemoDataService {
  private getData(): DemoData {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    return initialData;
  }

  private saveData(data: DemoData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Generic CRUD operations
  getAll(entity: keyof DemoData): any[] {
    const data = this.getData();
    return data[entity] || [];
  }

  getById(entity: keyof DemoData, id: string): any | null {
    const items = this.getAll(entity);
    return items.find(item => item.id === id) || null;
  }

  create(entity: keyof DemoData, item: any): any {
    const data = this.getData();
    const newItem = {
      ...item,
      id: item.id || Date.now().toString(),
      createdAt: item.createdAt || new Date().toISOString().split('T')[0]
    };
    
    if (!data[entity]) {
      data[entity] = [];
    }
    
    data[entity].push(newItem);
    this.saveData(data);
    return newItem;
  }

  update(entity: keyof DemoData, id: string, updates: any): any | null {
    const data = this.getData();
    const items = data[entity] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.saveData(data);
      return items[index];
    }
    
    return null;
  }

  delete(entity: keyof DemoData, id: string): boolean {
    const data = this.getData();
    const items = data[entity] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items.splice(index, 1);
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  // Bulk operations
  bulkCreate(entity: keyof DemoData, items: any[]): any[] {
    const data = this.getData();
    const newItems = items.map(item => ({
      ...item,
      id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: item.createdAt || new Date().toISOString().split('T')[0]
    }));
    
    if (!data[entity]) {
      data[entity] = [];
    }
    
    data[entity].push(...newItems);
    this.saveData(data);
    return newItems;
  }

  // Reset to initial data (for demo reset)
  resetData(): void {
    this.saveData(initialData);
  }

  // Export data as JSON (for backup/download)
  exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  // Import data from JSON
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const demoDataService = new DemoDataService();