import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Transaction } from './useTransactions';
import { useCouples } from './useCouples';

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
  transaction_id?: string;
  parent_planning_id?: string;
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

export interface PlanningWithTransaction extends Planning {
  transaction?: Transaction;
}

export function usePlanning() {
  const [plannings, setPlannings] = useState<PlanningWithTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useCouples();

  const fetchPlannings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Se o usuário faz parte de um casal, buscar planejamentos do casal também
      let query = supabase
        .from('plannings')
        .select(`
          *,
          transaction:transactions(*)
        `);

      if (profile?.couple_id) {
        // Buscar planejamentos do usuário e do parceiro
        const { data: coupleMembers } = await supabase
          .from('profiles')
          .select('id')
          .eq('couple_id', profile.couple_id);
        
        const memberIds = coupleMembers?.map(member => member.id) || [user.id];
        query = query.in('user_id', memberIds);
      } else {
        // Buscar apenas planejamentos do usuário
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

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

  const fetchPlanningHistory = async (planningId: string) => {
    if (!user) return [];

    try {
      // Buscar o planejamento principal
      const { data: mainPlanning, error: mainError } = await supabase
        .from('plannings')
        .select(`
          *,
          transaction:transactions(*)
        `)
        .eq('id', planningId)
        .single();

      if (mainError) throw mainError;

      // Se for parcelado, buscar todas as parcelas relacionadas
      if (mainPlanning.installments && mainPlanning.installments > 1) {
        // Buscar pelo parent_planning_id se este for uma parcela filha
        const searchId = mainPlanning.parent_planning_id || planningId;
        
        const { data: allInstallments, error: installmentsError } = await supabase
          .from('plannings')
          .select(`
            *,
            transaction:transactions(*)
          `)
          .or(`parent_planning_id.eq.${searchId},id.eq.${searchId}`)
          .order('current_installment', { ascending: true });

        if (installmentsError) throw installmentsError;
        return allInstallments || [];
      }

      return [mainPlanning];
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  };

  const createPlanning = async (planningData: CreatePlanningData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const planningsToInsert = [];
      const { installments = 1, amount, ...baseData } = planningData;
      const installmentAmount = amount / installments;
      let parentPlanningId: string | null = null;

      for (let i = 0; i < installments; i++) {
        const planningId = crypto.randomUUID();
        
        const installmentData = {
          id: planningId,
          ...baseData,
          user_id: user.id,
          amount: installmentAmount,
          current_installment: i + 1,
          installments: installments,
          due_date: new Date(new Date(baseData.due_date).setMonth(new Date(baseData.due_date).getMonth() + i)).toISOString().split('T')[0],
          status: 'pending' as const,
          parent_planning_id: i === 0 ? null : parentPlanningId
        };
        
        if (i === 0) {
          parentPlanningId = planningId;
        }
        
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
      // Primeiro, criar a transação
      const planning = plannings.find(p => p.id === id);
      if (!planning) throw new Error('Planejamento não encontrado');

      const transactionData = {
        user_id: user?.id,
        amount: -Math.abs(planning.amount), // Planejamentos são sempre despesas
        description: planning.description,
        category: planning.category,
        type: 'expense' as const,
        due_date: planning.due_date,
        is_recurring: planning.is_recurring,
        installments: planning.installments,
        current_installment: planning.current_installment
      };

      const { data: transactionResult, error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Depois, atualizar o planejamento com o ID da transação
      const { data, error } = await supabase
        .from('plannings')
        .update({ 
          status: 'paid',
          transaction_id: transactionResult.id
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setPlannings(prev => 
        prev.map(planning => 
          planning.id === id ? { 
            ...planning, 
            status: 'paid' as const,
            transaction_id: transactionResult.id,
            transaction: transactionResult
          } : planning
        )
      );

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const reversePaidStatus = async (id: string) => {
    try {
      const planning = plannings.find(p => p.id === id);
      if (!planning || !planning.transaction_id) {
        throw new Error('Planejamento não encontrado ou não possui transação vinculada');
      }

      // Excluir a transação
      const { error: deleteTransactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', planning.transaction_id);

      if (deleteTransactionError) throw deleteTransactionError;

      // Atualizar o planejamento para pending
      const { data, error } = await supabase
        .from('plannings')
        .update({ 
          status: 'pending',
          transaction_id: null
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setPlannings(prev => 
        prev.map(planning => 
          planning.id === id ? { 
            ...planning, 
            status: 'pending' as const,
            transaction_id: undefined,
            transaction: undefined
          } : planning
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
        amount: -Math.abs(planning.amount), // Planejamentos são sempre despesas
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
  }, [user, profile?.couple_id]);

  return {
    plannings,
    loading,
    error,
    fetchPlanningHistory,
    createPlanning,
    updatePlanning,
    deletePlanning,
    markAsPaid,
    reversePaidStatus,
    createTransactionFromPlanning,
    refetch: fetchPlannings
  };
}