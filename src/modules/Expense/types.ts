export interface Expense {
  id: string;
  hostelId: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseFormData = Omit<Expense, 'id' | 'hostelId' | 'createdAt' | 'updatedAt'>;
