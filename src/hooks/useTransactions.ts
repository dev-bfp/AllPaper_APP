import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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
  is_recurring: boolean;
  created_at: string;
  card?: {
    name: string;
    bank: string;
  };
}

export interface CreateTransactionData {
  card_id?: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  installments?: number;
  current_installment?: number;
  due_date: string;
  is_recurring?: boolean;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          card:cards(name, bank)
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateTransactionData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const transactionsToInsert = [];
      const { installments = 1, amount, ...baseData } = transactionData;
      const installmentAmount = amount / installments;

      for (let i = 0; i < installments; i++) {
        const installmentData = {
          ...baseData,
          user_id: user.id,
          amount: installmentAmount,
          current_installment: i + 1,
          due_date: new Date(new Date(baseData.due_date).setMonth(new Date(baseData.due_date).getMonth() + i)).toISOString().split('T')[0],
          is_recurring: baseData.is_recurring || false
        };
        transactionsToInsert.push(installmentData);
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert)
        .select(`
          *,
          card:cards(name, bank)
        `);

      if (error) throw error;
      
      setTransactions(prev => [...data, ...prev]);
      recalculateBalance();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateTransaction = async (id: string, updates: Partial<CreateTransactionData>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          card:cards(name, bank)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? data : transaction
        )
      );

      recalculateBalance();

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      recalculateBalance();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const duplicateTransaction = async (transaction: Transaction) => {
    const duplicateData: CreateTransactionData = {
      card_id: transaction.card_id,
      amount: transaction.amount,
      description: `${transaction.description} (Cópia)`,
      category: transaction.category,
      type: transaction.type,
      installments: transaction.installments,
      current_installment: transaction.current_installment,
      due_date: new Date().toISOString().split('T')[0],
      is_recurring: transaction.is_recurring
    };

    const result = await createTransaction(duplicateData);
    recalculateBalance();
    return result;
  };

  const recalculateBalance = () => {
    // Implement the logic to recalculate the balance based on the updated transactions
    // This could involve summing up the amounts of all transactions, considering their type (income/expense)
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    refetch: fetchTransactions
  };
}
