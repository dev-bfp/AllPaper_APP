import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Account {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  balance: number;
  created_at: string;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (newAccount: Omit<Account, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...newAccount, user_id: user?.id }]);

      if (error) throw error;
      if (data && data.length > 0) {
        setAccounts((prevAccounts) => [data[0], ...prevAccounts]);
      }
    } catch (err) {
      console.error('Erro ao adicionar conta:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return { accounts, loading, refetch: fetchAccounts, addAccount };
}
