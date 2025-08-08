import React from 'react';
import { X, Calendar, CheckCircle, Clock, XCircle, Undo2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlanning, PlanningWithTransaction, markAsPaid } from '../../hooks/usePlanning';

interface PlanningHistoryModalProps {
  planning: PlanningWithTransaction;
  onClose: () => void;
}

export default function PlanningHistoryModal({ planning, onClose }: PlanningHistoryModalProps) {
  const { fetchPlanningHistory, reversePaidStatus, markAsPaid } = usePlanning();
  const [historyItems, setHistoryItems] = React.useState<PlanningWithTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showReverseConfirm, setShowReverseConfirm] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const history = await fetchPlanningHistory(planning.id);
      setHistoryItems(history);
      setLoading(false);
    };
    
    loadHistory();
  }, [planning.id, fetchPlanningHistory]);

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

  const handleMarkAsPaid = async (planningId: string) => {
    const { error } = await markAsPaid(planningId);
    if (error) {
      alert(`Erro ao registrar transação: ${error}`);
    } else {
      // Recarregar o histórico
      const history = await fetchPlanningHistory(planning.id);
      setHistoryItems(history);
    }
  };

  const handleReversePaidStatus = async (planningId: string) => {
    const { error } = await reversePaidStatus(planningId);
    if (error) {
      alert(`Erro ao estornar pagamento: ${error}`);
    } else {
      // Recarregar o histórico
      const history = await fetchPlanningHistory(planning.id);
      setHistoryItems(history);
      setShowReverseConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
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
                  <span className="font-medium">Valor por Parcela:</span> {formatAmount(planning.amount)}
                </div>
                <div>
                  <span className="font-medium">Parcelas:</span> {planning.installments || 1}x
                </div>
                <div>
                  <span className="font-medium">Valor Total:</span> {formatAmount(planning.amount * (planning.installments || 1))}
                </div>
                <div>
                  <span className="font-medium">Recorrente:</span> {planning.is_recurring ? 'Sim' : 'Não'}
                </div>
                <div>
                  <span className="font-medium">Data Base:</span> {formatDate(planning.due_date)}
                </div>
              </div>
            </div>

            {/* Lista de Parcelas */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {historyItems.length > 1 ? `Parcelas (${historyItems.length})` : 'Detalhes do Planejamento'}
              </h4>
              
              {historyItems.map((installment, index) => (
                <div
                  key={installment.id}
                  className={`p-4 border rounded-lg ${
                    installment.status === 'paid' 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                      : installment.status === 'overdue'
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(installment.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {historyItems.length > 1 
                            ? `Parcela ${installment.current_installment || index + 1} de ${planning.installments || 1}`
                            : installment.description
                          }
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Vencimento: {formatDate(installment.due_date)}
                        </p>
                        {installment.transaction && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Pago em: {formatDate(installment.transaction.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatAmount(installment.amount)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(installment.status)}`}>
                        {getStatusText(installment.status)}
                      </span>
                      {installment.status === 'paid' && installment.transaction_id && (
                        <button
                          onClick={() => setShowReverseConfirm(installment.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          title="Estornar pagamento"
                        >
                          <Undo2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                      {installment.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(installment.id)}
                          className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                          title="Marcar como pago"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {historyItems.length > 1 && (
                <span>
                  {historyItems.filter(item => item.status === 'paid').length} de {historyItems.length} parcelas pagas
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Estorno */}
      {showReverseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Estorno
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja estornar este pagamento? A transação vinculada será excluída e o status voltará para "Em Aberto".
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReverseConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReversePaidStatus(showReverseConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
              >
                Estornar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}