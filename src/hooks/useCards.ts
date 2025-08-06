import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Card {
  id: string;
  user_id: string;
  name: string;
  type: 'credit' | 'debit';
  last_four: string;
  bank: string;
  limit_amount?: number;
  current_balance?: number;
  created_at: string;
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar cartões:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (newCard: Omit<Card, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{ ...newCard, user_id: user?.id }]);

      if (error) throw error;
      if (data && data.length > 0) {
        setCards((prevCards) => [data[0], ...prevCards]);
      }
    } catch (err) {
      console.error('Erro ao adicionar cartão:', err);
    }
  };

  const updateCard = async (updatedCard: Card) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update(updatedCard)
        .eq('id', updatedCard.id);

      if (error) throw error;
      setCards((prevCards) =>
        prevCards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
    } catch (err) {
      console.error('Erro ao atualizar cartão:', err);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    } catch (err) {
      console.error('Erro ao excluir cartão:', err);
    }
  };

  const recalculateCardBalance = async (cardId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('card_id', cardId);

      if (error) throw error;

      const totalUsed = data.reduce((acc: number, transaction: { amount: number, type: string }) => {
        return transaction.type === 'expense' ? acc + transaction.amount : acc;
      }, 0);

      const cardToUpdate = cards.find(card => card.id === cardId);
      if (cardToUpdate) {
        const updatedCard = {
          ...cardToUpdate,
          current_balance: totalUsed
        };
        await updateCard(updatedCard);
      }
    } catch (err) {
      console.error('Erro ao recalcular saldo do cartão:', err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  return { cards, loading, refetch: fetchCards, addCard, updateCard, deleteCard, recalculateCardBalance };
}
