import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { Staff, StaffFormData } from './types';

export const staffService = {
  getAll: () => getAll('staff') as Promise<Staff[]>,
  getById: (id: string) => getById('staff', id) as Promise<Staff>,
  create: (data: StaffFormData) => create('staff', data) as Promise<Staff>,
  update: (id: string, data: Partial<StaffFormData>) => update('staff', id, data) as Promise<Staff>,
  delete: (id: string) => remove('staff', id) as Promise<void>
};
