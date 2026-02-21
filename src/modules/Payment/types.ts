export interface Payment {
  id: string;
  tenantId: string;
  tenantName?: string;
  amount: number;
  type: 'rent' | 'deposit' | 'electricity' | 'food' | 'maintenance' | 'other';
  month: string;
  paymentMethod: 'cash' | 'online' | 'card' | 'upi';
  transactionId?: string;
  notes?: string;
  hostelId: string;
  hostelName?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}
