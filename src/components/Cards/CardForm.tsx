import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Card } from '../../types';

interface CardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Omit<Card, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: Partial<Card>;
  title: string;
}

const banks = [
  'Nubank',
  'Banco do Brasil',
  'Bradesco',
  'Itaú',
  'Santander',
  'Caixa Econômica',
  'BTG Pactual',
  'Inter',
  'C6 Bank',
  'PicPay',
  'Banco Original',
  'Neon',
  'Next',
  'Outros'
];

export default function CardForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: CardFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'credit' as 'credit' | 'debit',
    last_four: initialData?.last_four || '',
    bank: initialData?.bank || '',
    limit_amount: initialData?.limit_amount || null,
    current_balance: initialData?.current_balance || 0
  });
  const [loading, setLoading] = useState(false);
  const [balanceTouched, setBalanceTouched] = useState(false);
  const [limitTouched, setLimitTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        limit_amount: formData.type === 'credit' ? formData.limit_amount : null
      });
      onClose();
      setFormData({
        name: '',
        type: 'credit',
        last_four: '',
        bank: '',
        limit_amount: null,
        current_balance: 0
      });
      setBalanceTouched(false);
      setLimitTouched(false);
    } catch (error) {
      console.error('Erro ao salvar cartão/conta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceFocus = () => {
    if (!balanceTouched && formData.current_balance === 0) {
      setFormData({ ...formData, current_balance: '' });
      setBalanceTouched(true);
    }
  };

  const handleLimitFocus = () => {
    if (!limitTouched && formData.limit_amount === null) {
      setFormData({ ...formData, limit_amount: '' });
      setLimitTouched(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Código anterior permanece igual */}

          {formData.type === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Limite (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.limit_amount || ''}
                onChange={(e) => setFormData({ ...formData, limit_amount: parseFloat(e.target.value) || null })}
                onFocus={handleLimitFocus}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="5000.00"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formData.type === 'credit' ? 'Saldo Atual (R$)' : 'Saldo Disponível (R$)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current_balance || ''}
              onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
              onFocus={handleBalanceFocus}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>

          {/* Restante do código permanece igual */}
        </form>
      </div>
    </div>
  );
}
