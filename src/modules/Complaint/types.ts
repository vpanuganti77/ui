export interface Complaint {
  id: string;
  hostelId: string;
  tenantId: string;
  tenantName: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type ComplaintFormData = Omit<Complaint, 'id' | 'hostelId' | 'tenantName' | 'createdAt' | 'updatedAt' | 'resolvedAt'>;
