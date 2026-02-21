export interface Staff {
  id: string;
  hostelId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive';
  address: string;
  emergencyContact: string;
  createdAt: string;
  updatedAt: string;
}

export type StaffFormData = Omit<Staff, 'id' | 'hostelId' | 'createdAt' | 'updatedAt'>;
