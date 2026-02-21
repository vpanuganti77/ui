import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { Expense, ExpenseFormData } from './types';

export const expenseService = {
  getAll: () => getAll('expenses') as Promise<Expense[]>,
  getById: (id: string) => getById('expenses', id) as Promise<Expense>,
  create: (data: ExpenseFormData) => create('expenses', data) as Promise<Expense>,
  update: (id: string, data: Partial<ExpenseFormData>) => update('expenses', id, data) as Promise<Expense>,
  delete: (id: string) => remove('expenses', id) as Promise<void>
};
