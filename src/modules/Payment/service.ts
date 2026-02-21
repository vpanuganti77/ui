import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { Payment } from './types';

export const paymentService = {
  async getAll(): Promise<Payment[]> {
    return await getAll('payments');
  },

  async getById(id: string): Promise<Payment> {
    return await getById('payments', id);
  },

  async create(payment: Partial<Payment>): Promise<Payment> {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await create('payments', newPayment);
  },

  async update(id: string, payment: Partial<Payment>): Promise<Payment> {
    const updatedPayment = {
      ...payment,
      updatedAt: new Date().toISOString()
    };
    return await update('payments', id, updatedPayment);
  },

  async delete(id: string): Promise<void> {
    return await remove('payments', id);
  }
};
