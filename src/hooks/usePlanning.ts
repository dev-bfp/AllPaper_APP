import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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
  created_at: string;
}

export interface CreatePlanningData {
  description: string;
  amount: number;
  category: string;
  due_date: string;
  is_recurring: boolean;
  installments?: number;
  current_installment?: number;
}

export function usePlanning() {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlannings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plannings')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Atualizar status baseado na data de vencimento
      const updatedPlannings = (data || []).map(planning => {
        const today = new Date();
        const dueDate = new Date(planning.due_date);
        
        let status = planning.status;
        if (status !== 'paid') {
          if (dueDate < today) {
            status = 'overdue';
          } else {
            status = 'pending';
          }
        }
        
        return { ...planning, status };
      });

      setPlannings(updatedPlannings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPlanning = async (planningData: CreatePlanningData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const planningsToInsert = [];
      const { installments = 1, amount, ...baseData } = planningData;
      const installmentAmount = amount / installments;

      for (let i = 0; i < installments; i++) {
        const installmentData = {
          ...baseData,
          user_id: user.id,
          amount: installmentAmount,
          current_installment: i + 1,
          installments: installments,
          due_date: new Date(new Date(baseData.due_date).setMonth(new Date(baseData.due_date).getMonth() + i)).toISOString().split('T')[0],
          status: 'pending' as const
        };
        planningsToInsert.push(installmentData);
      }

      const { data, error } = await supabase
        .from('plannings')
        .insert(planningsToInsert)
        .select();

      if (error) throw error;
      
      setPlannings(prev => [...data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updatePlanning = async (id: string, updates: Partial<CreatePlanningData>) => {
    try {
      const { data, error } = await supabase
        .from('plannings')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setPlannings(prev => 
        prev.map(planning => 
          planning.id === id ? data : planning
        )
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deletePlanning = async (id: string) => {
    try {
      const { error } = await supabase
        .from('plannings')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPlannings(prev => prev.filter(planning => planning.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('plannings')
        .update({ status: 'paid' })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setPlannings(prev => 
        prev.map(planning => 
          planning.id === id ? { ...planning, status: 'paid' as const } : planning
        )
      );

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const createTransactionFromPlanning = async (planningId: string) => {
    try {
      const planning = plannings.find(p => p.id === planningId);
      if (!planning) throw new Error('Planejamento não encontrado');

      const transactionData = {
        user_id: user?.id,
        amount: planning.amount,
        description: planning.description,
        category: planning.category,
        type: 'expense' as const,
        due_date: planning.due_date,
        is_recurring: planning.is_recurring,
        installments: planning.installments,
        current_installment: planning.current_installment
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (error) throw error;

      // Marcar o planejamento como pago
      await markAsPaid(planningId);

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchPlannings();
  }, [user]);

  return {
    plannings,
    loading,
    error,
    createPlanning,
    updatePlanning,
    deletePlanning,
    markAsPaid,
    createTransactionFromPlanning,
    refetch: fetchPlannings
  };
}