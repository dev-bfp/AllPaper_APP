import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  MoreVertical,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  History
} from 'lucide-react';
import { usePlanning } from '../../hooks/usePlanning';
import PlanningForm from './PlanningForm';
import PlanningHistoryModal from './PlanningHistoryModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlanningList() {
  const { 
    plannings, 
    loading, 
    error, 
    createPlanning, 
    updatePlanning, 
    deletePlanning,
    markAsPaid
  } = usePlanning();

  const [showForm, setShowForm] = useState(false);
  const [editingPlanning, setEditingPlanning] = useState<Planning | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<Planning | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [filterType, setFilterType] = useState<'all' | 'recurring' | 'one-time'>('all');

  // Filtrar planejamentos
  const filteredPlannings = plannings.filter(planning => {
    const matchesSearch = planning.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         planning.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || planning.status === filterStatus;
    const matchesType = filterType === 'all' || 
                       (filterType === 'recurring' && planning.is_recurring) ||
                       (filterType === 'one-time' && !planning.is_recurring);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = (planning: Planning) => {
    setEditingPlanning(planning);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deletePlanning(id);
    if (error) {
      alert(`Erro ao excluir: ${error}`);
    }
    setDeleteConfirm(null);
  };

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await markAsPaid(id);
    if (error) {
      alert(`Erro ao marcar como pago: ${error}`);
    }
  };

  const handleFormSubmit = async (data: CreatePlanningData) => {
    if (editingPlanning) {
      return await updatePlanning(editingPlanning.id, data);
    } else {
      return await createPlanning(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlanning(null);
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
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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
        <p className="text-red-600 dark:text-red-400">Erro ao carregar planejamentos: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Planejamento Financeiro
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Planejamento</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar planejamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Em Aberto</option>
            <option value="overdue">Vencido</option>
          </select>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'recurring' | 'one-time')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="recurring">Recorrente</option>
            <option value="one-time">Único</option>
          </select>

          {/* Limpar filtros */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterType('all');
            }}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Lista de Planejamentos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredPlannings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {plannings.length === 0 
                ? 'Nenhum planejamento encontrado. Crie seu primeiro planejamento!'
                : 'Nenhum planejamento corresponde aos filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPlannings.map((planning) => (
              <PlanningItem
                key={planning.id}
                planning={planning}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirm(id)}
                onMarkAsPaid={handleMarkAsPaid}
                onShowHistory={(planning) => setShowHistory(planning)}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formulário */}
      <PlanningForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingPlanning ? {
          description: editingPlanning.description,
          amount: editingPlanning.amount,
          category: editingPlanning.category,
          due_date: editingPlanning.due_date,
          is_recurring: editingPlanning.is_recurring,
          installments: editingPlanning.installments,
          current_installment: editingPlanning.current_installment
        } : undefined}
        title={editingPlanning ? 'Editar Planejamento' : 'Novo Planejamento'}
      />

      {/* Modal de Histórico */}
      {showHistory && (
        <PlanningHistoryModal
          planning={showHistory}
          onClose={() => setShowHistory(null)}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este planejamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PlanningItemProps {
  planning: Planning;
  onEdit: (planning: Planning) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onShowHistory: (planning: Planning) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
}

function PlanningItem({ 
  planning, 
  onEdit, 
  onDelete, 
  onMarkAsPaid, 
  onShowHistory,
  getStatusIcon,
  getStatusText,
  getStatusColor
}: PlanningItemProps) {
  const [showActions, setShowActions] = useState(false);

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

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(planning.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {planning.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(planning.due_date)}</span>
                </span>
                <span>{planning.category}</span>
                {planning.installments && (
                  <span>
                    {planning.current_installment || 1}/{planning.installments}x
                  </span>
                )}
                {planning.is_recurring && (
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                    Recorrente
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(planning.status)}`}>
                  {getStatusText(planning.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatAmount(planning.amount)}
          </span>

          <div className="flex items-center space-x-1">
            {planning.status !== 'paid' && (
              <button
                onClick={() => onMarkAsPaid(planning.id)}
                className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                title="Marcar como pago"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </button>
            )}

            {planning.installments && planning.installments > 1 && (
              <button
                onClick={() => onShowHistory(planning)}
                className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                title="Ver histórico"
              >
                <History className="h-4 w-4 text-blue-600" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={() => {
                      onEdit(planning);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(planning.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}