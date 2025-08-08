import React, { useState } from 'react';
import { X, Settings, Edit2, Save } from 'lucide-react';
import { useCouples, Couple } from '../../hooks/useCouples';

interface CoupleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: Couple | null;
}

export default function CoupleSettingsModal({ isOpen, onClose, couple }: CoupleSettingsModalProps) {
  const [name, setName] = useState(couple?.name || '');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { updateCoupleName } = useCouples();

  React.useEffect(() => {
    if (couple) {
      setName(couple.name);
    }
  }, [couple]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !couple) return;

    setLoading(true);
    try {
      const { error } = await updateCoupleName(name.trim());
      if (error) {
        alert(`Erro ao atualizar nome: ${error}`);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      alert('Erro inesperado ao atualizar nome');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !couple) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Configurações do Casal</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Casal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Casal
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''
                  }`}
                  maxLength={50}
                />
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {name.length}/50 caracteres
                </p>
              )}
            </div>

            {/* Informações do Casal */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Informações do Casal
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID do Casal:</span>
                  <span className="font-mono text-gray-900 dark:text-white text-xs">
                    {couple.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Criado em:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(couple.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recursos Compartilhados */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Recursos Compartilhados
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Visualização de transações do parceiro(a)</li>
                <li>• Metas financeiras compartilhadas</li>
                <li>• Planejamentos em conjunto</li>
                <li>• Orçamentos familiares</li>
              </ul>
            </div>
          </form>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}