import React from 'react';
import { X, Calendar, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlanning } from '../../hooks/usePlanning';

interface PlanningHistoryModalProps {
  planning: Planning;
  onClose: () => void;
}

export default function PlanningHistoryModal({ planning, onClose }: PlanningHistoryModalProps) {
  const { createTransactionFromPlanning } = usePlanning();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Em Aberto';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleCreateTransaction = async () => {
    const { error } = await createTransactionFromPlanning(planning.id);
    if (error) {
      alert(`Erro ao registrar transação: ${error}`);
    } else {
      alert('Transação registrada com sucesso!');
      onClose();
    }
  };

  // Gerar histórico de parcelas se for parcelado
  const generateInstallmentHistory = () => {
    if (!planning.installments || planning.installments <= 1) {
      return [planning];
    }

    const installments = [];
    const baseDate = new Date(planning.due_date);
    
    for (let i = 0; i < planning.installments; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(baseDate.getMonth() + i);
      
      installments.push({
        ...planning,
        id: `${planning.id}-${i + 1}`,
        current_installment: i + 1,
        due_date: installmentDate.toISOString().split('T')[0],
        amount: planning.amount / planning.installments,
        status: i < (planning.current_installment || 1) - 1 ? 'paid' : 
                i === (planning.current_installment || 1) - 1 ? planning.status : 'pending'
      });
    }
    
    return installments;
  };

  const installmentHistory = generateInstallmentHistory();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Histórico de Parcelas
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Informações do Planejamento */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {planning.description}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Categoria:</span> {planning.category}
              </div>
              <div>
                <span className="font-medium">Valor Total:</span> {formatAmount(planning.amount)}
              </div>
              <div>
                <span className="font-medium">Parcelas:</span> {planning.installments || 1}x
              </div>
              <div>
                <span className="font-medium">Recorrente:</span> {planning.is_recurring ? 'Sim' : 'Não'}
              </div>
            </div>
          </div>

          {/* Botão para Registrar Transação */}
          <div className="mb-6">
            <button
              onClick={handleCreateTransaction}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar como Transação</span>
            </button>
          </div>

          {/* Lista de Parcelas */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Parcelas
            </h4>
            
            {installmentHistory.map((installment, index) => (
              <div
                key={installment.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(installment.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Parcela {installment.current_installment || index + 1} de {planning.installments || 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vencimento: {formatDate(installment.due_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatAmount(installment.amount)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(installment.status)}`}>
                    {getStatusText(installment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}