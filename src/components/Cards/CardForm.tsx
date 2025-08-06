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
    } catch (error) {
      console.error('Erro ao salvar cartão/conta:', error);
    } finally {
      setLoading(false);
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
                  value="credit"
                  checked={formData.type === 'credit'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Cartão de Crédito</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="debit"
                  checked={formData.type === 'debit'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'debit' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Conta/Débito</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do {formData.type === 'credit' ? 'Cartão' : 'Conta'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.type === 'credit' ? 'Ex: Cartão Principal' : 'Ex: Conta Corrente'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Banco/Instituição
            </label>
            <select
              required
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o banco</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Últimos 4 dígitos
            </label>
            <input
              type="text"
              required
              maxLength={4}
              pattern="[0-9]{4}"
              value={formData.last_four}
              onChange={(e) => setFormData({ ...formData, last_four: e.target.value.replace(/\D/g, '') })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234"
            />
          </div>

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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{loading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}