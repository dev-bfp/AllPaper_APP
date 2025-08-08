import React, { useState } from 'react';
import { X, Heart, Users } from 'lucide-react';
import { useCouples } from '../../hooks/useCouples';

interface CreateCoupleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCoupleModal({ isOpen, onClose }: CreateCoupleModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createCouple } = useCouples();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const { error } = await createCouple(name.trim());
      if (error) {
        alert(`Erro ao criar casal: ${error}`);
      } else {
        onClose();
        setName('');
      }
    } catch (err) {
      alert('Erro inesperado ao criar casal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-600" />
            <span>Criar Casal</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Escolha um nome para representar vocês dois. Este nome será usado para identificar 
              suas finanças compartilhadas.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Casal
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: João & Maria, Família Silva..."
              maxLength={50}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {name.length}/50 caracteres
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Casal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}