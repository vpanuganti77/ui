export enum UserRole {
  MASTER_ADMIN = 'master_admin',
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
  TENANT = 'tenant'
}

export enum Permission {
  // Hostel Management
  CREATE_HOSTEL = 'create_hostel',
  VIEW_ALL_HOSTELS = 'view_all_hostels',
  MANAGE_HOSTEL_LICENSE = 'manage_hostel_license',
  
  // User Management
  CREATE_ADMIN = 'create_admin',
  CREATE_RECEPTIONIST = 'create_receptionist',
  MANAGE_USERS = 'manage_users',
  
  // Tenant Management
  VIEW_TENANTS = 'view_tenants',
  CREATE_TENANT = 'create_tenant',
  EDIT_TENANT = 'edit_tenant',
  DELETE_TENANT = 'delete_tenant',
  
  // Room Management
  VIEW_ROOMS = 'view_rooms',
  CREATE_ROOM = 'create_room',
  EDIT_ROOM = 'edit_room',
  DELETE_ROOM = 'delete_room',
  
  // Payment Management
  VIEW_PAYMENTS = 'view_payments',
  CREATE_PAYMENT = 'create_payment',
  EDIT_PAYMENT = 'edit_payment',
  DELETE_PAYMENT = 'delete_payment',
  
  // Complaint Management
  VIEW_COMPLAINTS = 'view_complaints',
  CREATE_COMPLAINT = 'create_complaint',
  EDIT_COMPLAINT = 'edit_complaint',
  DELETE_COMPLAINT = 'delete_complaint',
  
  // Staff Management
  VIEW_STAFF = 'view_staff',
  CREATE_STAFF = 'create_staff',
  EDIT_STAFF = 'edit_staff',
  DELETE_STAFF = 'delete_staff',
  
  // Financial Management
  VIEW_EXPENSES = 'view_expenses',
  CREATE_EXPENSE = 'create_expense',
  EDIT_EXPENSE = 'edit_expense',
  DELETE_EXPENSE = 'delete_expense',
  VIEW_REPORTS = 'view_reports',
  
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.MASTER_ADMIN]: [
    Permission.CREATE_HOSTEL,
    Permission.VIEW_ALL_HOSTELS,
    Permission.MANAGE_HOSTEL_LICENSE,
    Permission.CREATE_ADMIN,
    Permission.MANAGE_USERS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.ADMIN]: [
    Permission.CREATE_RECEPTIONIST,
    Permission.MANAGE_USERS,
    Permission.VIEW_TENANTS,
    Permission.CREATE_TENANT,
    Permission.EDIT_TENANT,
    Permission.DELETE_TENANT,
    Permission.VIEW_ROOMS,
    Permission.CREATE_ROOM,
    Permission.EDIT_ROOM,
    Permission.DELETE_ROOM,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.EDIT_PAYMENT,
    Permission.DELETE_PAYMENT,
    Permission.VIEW_COMPLAINTS,
    Permission.CREATE_COMPLAINT,
    Permission.EDIT_COMPLAINT,
    Permission.DELETE_COMPLAINT,
    Permission.VIEW_STAFF,
    Permission.CREATE_STAFF,
    Permission.EDIT_STAFF,
    Permission.DELETE_STAFF,
    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    Permission.EDIT_EXPENSE,
    Permission.DELETE_EXPENSE,
    Permission.VIEW_REPORTS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.RECEPTIONIST]: [
    Permission.VIEW_TENANTS,
    Permission.CREATE_TENANT,
    Permission.EDIT_TENANT,
    Permission.VIEW_ROOMS,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.VIEW_COMPLAINTS,
    Permission.CREATE_COMPLAINT,
    Permission.EDIT_COMPLAINT,
    Permission.VIEW_DASHBOARD
  ],
  
  [UserRole.TENANT]: [
    Permission.VIEW_COMPLAINTS,
    Permission.CREATE_COMPLAINT
  ]
};

export interface Hostel {
  id: string;
  name: string;
  address: string;
  license: string;
  licenseDocument?: File | string;
  adminId: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  hostelId?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}