import React, { useState } from 'react';
import { X, Mail, UserPlus, Send } from 'lucide-react';
import { useCouples, Couple } from '../../hooks/useCouples';

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: Couple | null;
}

export default function InvitePartnerModal({ isOpen, onClose, couple }: InvitePartnerModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { invitePartner } = useCouples();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !couple) return;

    setLoading(true);
    try {
      const { error } = await invitePartner(email.trim());
      if (error) {
        alert(`Erro ao enviar convite: ${error}`);
      } else {
        alert('Convite enviado com sucesso!');
        onClose();
        setEmail('');
      }
    } catch (err) {
      alert('Erro inesperado ao enviar convite');
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
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Convidar Parceiro(a)</span>
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
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Envie um convite para seu parceiro(a) se juntar ao casal <strong>{couple?.name}</strong>. 
              Eles receberão um convite que poderão aceitar ou rejeitar.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email do Parceiro(a)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="parceiro@email.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Certifique-se de que o email está correto. O convite será enviado para este endereço.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Importante:</strong> Seu parceiro(a) precisa ter uma conta no AllPaper para aceitar o convite. 
              Se ele(a) ainda não tem conta, peça para criar uma usando o mesmo email.
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
              disabled={loading || !email.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Enviando...' : 'Enviar Convite'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}