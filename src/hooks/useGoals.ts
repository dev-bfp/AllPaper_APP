import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
  }, [user]);

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