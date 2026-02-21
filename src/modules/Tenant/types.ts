export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  roomId: string;
  room?: string;
  rent: number;
  deposit: number;
  joiningDate: string;
  aadharNumber: string;
  aadharFront?: string;
  aadharBack?: string;
  hostelId: string;
  hostelName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
