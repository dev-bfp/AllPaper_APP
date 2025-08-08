import React, { useState, useEffect } from 'react';
import { X, Target, DollarSign, Calendar, FileText } from 'lucide-react';

export interface CreateGoalData {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  description?: string;
}

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalData) => Promise<{ data: any; error: string | null }>;
  initialData?: Partial<CreateGoalData>;
  title: string;
}

export default function GoalForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: GoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGoalData>({
    name: '',
    target_amount: 0,
    current_amount: 0,
    target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano no futuro
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await onSubmit(formData);
      if (error) {
        alert(`Erro: ${error}`);
      } else {
        onClose();
        setFormData({
          name: '',
          target_amount: 0,
          current_amount: 0,
          target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: ''
        });
      }
    } catch (err) {
      alert('Erro inesperado ao salvar meta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome da Meta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Target className="inline h-4 w-4 mr-1" />
              Nome da Meta
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Reserva de emergência"
            />
          </div>

          {/* Valor Alvo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Valor Alvo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.target_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          {/* Valor Atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Valor Atual (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.current_amount || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, current_amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          {/* Data Alvo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data Alvo
            </label>
            <input
              type="date"
              required
              value={formData.target_date}
              onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descreva sua meta..."
            />
          </div>

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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}