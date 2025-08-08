import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

export interface CreatePlanningData {
  description: string;
  amount: number;
  category: string;
  due_date: string;
  is_recurring: boolean;
  installments?: number;
  current_installment?: number;
}

interface PlanningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePlanningData) => Promise<{ data: any; error: string | null }>;
  initialData?: Partial<CreatePlanningData>;
  title: string;
}

const categories = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Entretenimento',
  'Serviços',
  'Seguros',
  'Investimentos',
  'Empréstimos',
  'Cartão de Crédito',
  'Outros'
];

export default function PlanningForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: PlanningFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlanningData>({
    description: '',
    amount: 0,
    category: '',
    due_date: new Date().toISOString().split('T')[0],
    is_recurring: false
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
          description: '',
          amount: 0,
          category: '',
          due_date: new Date().toISOString().split('T')[0],
          is_recurring: false
        });
      }
    } catch (err) {
      alert('Erro inesperado ao salvar planejamento');
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
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Descrição
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Aluguel do apartamento"
            />
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
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Tag className="inline h-4 w-4 mr-1" />
              Categoria
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data de Vencimento
            </label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Parcelamento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parcelas
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={formData.installments || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  installments: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parcela Atual
              </label>
              <input
                type="number"
                min="1"
                max={formData.installments || 1}
                value={formData.current_installment || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  current_installment: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
                disabled={!formData.installments}
              />
            </div>
          </div>

          {/* Recorrente */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Gasto recorrente (mensal)
            </label>
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