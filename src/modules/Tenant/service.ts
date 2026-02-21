import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { Tenant } from './types';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    return await getAll('tenants');
  },

  async getById(id: string): Promise<Tenant> {
    return await getById('tenants', id);
  },

  async create(tenant: Partial<Tenant>): Promise<Tenant> {
    const newTenant = {
      ...tenant,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await create('tenants', newTenant);
  },

  async update(id: string, tenant: Partial<Tenant>): Promise<Tenant> {
    const updatedTenant = {
      ...tenant,
      updatedAt: new Date().toISOString()
    };
    return await update('tenants', id, updatedTenant);
  },

  async delete(id: string): Promise<void> {
    return await remove('tenants', id);
  }
};
