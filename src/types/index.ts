export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'master_admin' | 'admin' | 'receptionist' | 'tenant';
  hostelId?: string;
  hostelName?: string;
  avatar?: string;
  isActive: boolean;
}

export interface Hostel {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  adminId: string;
  totalRooms: number;
  settings: {
    rentDueDay: number;
    reminderDays: number;
    defaultRent: number;
  };
}

export interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'shared';
  capacity: number;
  rent: number;
  hostelId: string;
  occupancy: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  floor?: number;
  tenants?: Tenant[];
}

export interface Tenant {
  _id: string;
  userId: User;
  hostelId: string;
  roomId: Room;
  joiningDate: string;
  leavingDate?: string;
  rent: number;
  deposit: number;
  status: 'active' | 'vacated' | 'notice';
  gender: 'male' | 'female' | 'other';
  idProof?: {
    type: string;
    url: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  pendingDues: number;
}

export interface Payment {
  _id: string;
  tenantId: Tenant;
  hostelId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'electricity' | 'food' | 'maintenance' | 'other';
  month: string;
  paymentDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: 'cash' | 'online' | 'card' | 'upi';
  transactionId?: string;
  notes?: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'cleanliness' | 'food' | 'noise' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  tenantId: Tenant;
  hostelId: string;
  assignedTo?: User;
  adminNotes?: string;
  resolvedDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'maintenance' | 'payment' | 'event';
  priority: 'low' | 'medium' | 'high';
  hostelId: string;
  createdBy: User;
  isActive: boolean;
  expiryDate?: string;
  targetAudience: 'all' | 'male' | 'female';
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalTenants: number;
  totalIncome: number;
  totalDues: number;
  openComplaints: number;
  pendingDuesCount: number;
  totalExpenses?: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  token?: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}