export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  couple_id?: string;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  name: string;
  type: 'credit' | 'debit';
  last_four: string;
  bank: string;
  limit?: number;
  current_balance?: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  card_id?: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  installments?: number;
  current_installment?: number;
  due_date: string;
  is_recurring?: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  couple_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  description?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  couple_id?: string;
  category: string;
  monthly_limit: number;
  current_spent: number;
  month: string;
  created_at: string;
}

export interface Planning {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  is_recurring: boolean;
  installments?: number;
  current_installment?: number;
  transaction_id?: string;
  parent_planning_id?: string;
  created_at: string;
}