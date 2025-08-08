import React, { useState } from 'react';
import { X, Plus, Minus, DollarSign } from 'lucide-react';
import { Goal } from '../../hooks/useGoals';

interface GoalProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onUpdateProgress: (goalId: string, amount: number) => Promise<{ data: any; error: string | null }>;
}

export default function GoalProgressModal({ 
  isOpen, 
  onClose, 
  goal, 
  onUpdateProgress 
}: GoalProgressModalProps) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalAmount = operation === 'add' ? amount : -amount;
      const { error } = await onUpdateProgress(goal.id, finalAmount);
      
      if (error) {
        alert(`Erro: ${error}`);
      } else {
        onClose();
        setAmount(0);
        setOperation('add');
      }
    } catch (err) {
      alert('Erro inesperado ao atualizar progresso');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const newAmount = operation === 'add' 
    ? goal.current_amount + amount 
    : Math.max(0, goal.current_amount - amount);
  const newProgress = (newAmount / goal.target_amount) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Atualizar Progresso
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Informações da Meta */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {goal.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Valor Atual:</span>
                <span className="font-medium">{formatAmount(goal.current_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Alvo:</span>
                <span className="font-medium">{formatAmount(goal.target_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Progresso:</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Barra de Progresso Atual */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Operação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Operação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    operation === 'add'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Adicionar</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('subtract')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    operation === 'subtract'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Minus className="h-4 w-4" />
                    <span className="text-sm font-medium">Subtrair</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>

            {/* Preview do Novo Progresso */}
            {amount > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Novo Progresso
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                  <div className="flex justify-between">
                    <span>Novo Valor:</span>
                    <span className="font-medium">{formatAmount(newAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Novo Progresso:</span>
                    <span className="font-medium">{newProgress.toFixed(1)}%</span>
                  </div>
                </div>
                
                {/* Nova Barra de Progresso */}
                <div className="mt-3">
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(newProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
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
                disabled={loading || amount <= 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}