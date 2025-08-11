import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useCouples } from './useCouples';

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

export interface CreateGoalData {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  description?: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useCouples();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Se o usuário faz parte de um casal, buscar metas do casal também
      let query = supabase
        .from('goals')
        .select('*');

      if (profile?.couple_id) {
        // Buscar metas do usuário, do parceiro e metas compartilhadas do casal
        const { data: coupleMembers } = await supabase
          .from('profiles')
          .select('id')
          .eq('couple_id', profile.couple_id);
        
        const memberIds = coupleMembers?.map(member => member.id) || [user.id];
        query = query.or(`user_id.in.(${memberIds.join(',')}),couple_id.eq.${profile.couple_id}`);
      } else {
        // Buscar apenas metas do usuário
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateGoalData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id,
          current_amount: goalData.current_amount || 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateGoal = async (id: string, updates: Partial<CreateGoalData>) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? data : goal
        )
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) throw new Error('Meta não encontrada');

      const newAmount = Math.max(0, goal.current_amount + amount);
      
      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? data : goal
        )
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const getGoalProgress = (goal: Goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100;
    const remainingAmount = goal.target_amount - goal.current_amount;
    const daysRemaining = Math.ceil(
      (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      progress: Math.min(progress, 100),
      remainingAmount: Math.max(remainingAmount, 0),
      daysRemaining,
      isCompleted: goal.current_amount >= goal.target_amount,
      isOverdue: daysRemaining < 0 && goal.current_amount < goal.target_amount
    };
  };

  useEffect(() => {
    fetchGoals();
  }, [user, profile?.couple_id]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    getGoalProgress,
    refetch: fetchGoals
  };
}