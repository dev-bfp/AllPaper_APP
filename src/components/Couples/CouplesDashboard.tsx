import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  Settings, 
  Heart,
  UserPlus,
  Check,
  X,
  LogOut,
  Edit2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useCouples } from '../../hooks/useCouples';
import CreateCoupleModal from './CreateCoupleModal';
import InvitePartnerModal from './InvitePartnerModal';
import CoupleSettingsModal from './CoupleSettingsModal';

export default function CouplesDashboard() {
  const {
    profile,
    couple,
    coupleMembers,
    pendingInvites,
    sentInvites,
    loading,
    error,
    acceptInvite,
    rejectInvite,
    leaveCouple
  } = useCouples();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleAcceptInvite = async (inviteId: string) => {
    const { error } = await acceptInvite(inviteId);
    if (error) {
      alert(`Erro ao aceitar convite: ${error}`);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    const { error } = await rejectInvite(inviteId);
    if (error) {
      alert(`Erro ao rejeitar convite: ${error}`);
    }
  };

  const handleLeaveCouple = async () => {
    const { error } = await leaveCouple();
    if (error) {
      alert(`Erro ao sair do casal: ${error}`);
    } else {
      setShowLeaveConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Heart className="h-6 w-6 text-red-500" />
          <span>Gestão de Casal</span>
        </h2>
      </div>

      {/* Convites Pendentes */}
      {pendingInvites.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Convites Recebidos</span>
          </h3>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Convite para: {invite.couple?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enviado por: {invite.inviter?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    <span>Aceitar</span>
                  </button>
                  <button
                    onClick={() => handleRejectInvite(invite.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Rejeitar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status do Casal */}
      {couple ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {couple.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Criado em {new Date(couple.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Convidar</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>

          {/* Membros do Casal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {coupleMembers.map((member) => (
              <div key={member.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                      {member.id === profile?.id && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Membro desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Convites Enviados */}
          {sentInvites.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Convites Enviados
              </h4>
              <div className="space-y-2">
                {sentInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {invite.invited_email}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invite.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : invite.status === 'accepted'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      {invite.status === 'pending' ? 'Pendente' : 
                       invite.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair do Casal</span>
            </button>
          </div>
        </div>
      ) : (
        /* Criar Casal */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Gerencie suas finanças em casal
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Crie um casal para compartilhar e gerenciar suas finanças junto com seu parceiro(a). 
              Vocês poderão ver transações, metas e planejamentos compartilhados.
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Criar Casal</span>
          </button>
        </div>
      )}

      {/* Modais */}
      <CreateCoupleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <InvitePartnerModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        couple={couple}
      />

      <CoupleSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        couple={couple}
      />

      {/* Modal de Confirmação para Sair do Casal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Saída
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja sair do casal? Você perderá acesso às finanças compartilhadas.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleLeaveCouple}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
              >
                Sair do Casal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}