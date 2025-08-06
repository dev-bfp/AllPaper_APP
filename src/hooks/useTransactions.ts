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
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
          is_recurring: transactionData.is_recurring || false
        }])
        .select(`
          *,
          card:cards(name, bank)
        `)
        .single();

      if (error) throw error;
      
      setTransactions(prev => [data, ...prev]);
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

    return await createTransaction(duplicateData);
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