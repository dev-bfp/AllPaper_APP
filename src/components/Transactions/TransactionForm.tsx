import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: Partial<Transaction>;
  title: string;
}

const categories = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Entretenimento',
  'Saúde',
  'Educação',
  'Compras',
  'Serviços',
  'Investimentos',
  'Salário',
  'Freelance',
  'Outros'
];

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    category: initialData?.category || '',
    type: initialData?.type || 'expense' as 'income' | 'expense',
    due_date: initialData?.due_date || new Date().toISOString().split('T')[0],
    installments: initialData?.installments || 1,
    current_installment: initialData?.current_installment || 1,
    is_recurring: initialData?.is_recurring || false,
    card_id: initialData?.card_id || null
  });
  const [loading, setLoading] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount)
      });
      onClose();
      setFormData({
        amount: 0,
        description: '',
        category: '',
        type: 'expense',
        due_date: new Date().toISOString().split('T')[0],
        installments: 1,
        current_installment: 1,
        is_recurring: false,
        card_id: null
      });
      setAmountTouched(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountFocus = () => {
    if (!amountTouched && formData.amount === 0) {
      setFormData({ ...formData, amount: '' });
      setAmountTouched(true);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Despesa</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Receita</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Supermercado, Salário, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={Math.abs(formData.amount)}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              onFocus={handleAmountFocus}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0,00"
            />
          </div>

          {/* Restante do código permanece igual */}
        </form>
      </div>
    </div>
  );
}
