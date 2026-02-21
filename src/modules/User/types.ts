export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'master_admin' | 'admin' | 'receptionist' | 'tenant';
  password: string;
  status: 'active' | 'inactive';
  hostelId?: string;
  hostelName?: string;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  lockedAt?: string;
  lockedBy?: string;
  firstLogin?: boolean;
  createdAt: string;
  updatedAt: string;
}
