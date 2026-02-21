import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { Complaint, ComplaintFormData } from './types';

export const complaintService = {
  getAll: () => getAll('complaints') as Promise<Complaint[]>,
  getById: (id: string) => getById('complaints', id) as Promise<Complaint>,
  create: (data: ComplaintFormData) => create('complaints', data) as Promise<Complaint>,
  update: (id: string, data: Partial<ComplaintFormData>) => update('complaints', id, data) as Promise<Complaint>,
  delete: (id: string) => remove('complaints', id) as Promise<void>
};
