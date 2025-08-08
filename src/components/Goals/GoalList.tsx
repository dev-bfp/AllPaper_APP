import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Target, 
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import GoalProgressModal from './GoalProgressModal';

export default function GoalList() {
  const { 
    goals, 
    loading, 
    error, 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    updateGoalProgress,
    getGoalProgress 
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [progressGoal, setProgressGoal] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  // Filtrar metas
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const progress = getGoalProgress(goal);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && progress.isCompleted) ||
                         (filterStatus === 'overdue' && progress.isOverdue) ||
                         (filterStatus === 'active' && !progress.isCompleted && !progress.isOverdue);
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteGoal(id);
    if (error) {
      alert(`Erro ao excluir: ${error}`);
    }
    setDeleteConfirm(null);
  };

  const handleUpdateProgress = (goal: any) => {
    setProgressGoal(goal);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingGoal) {
      return await updateGoal(editingGoal.id, data);
    } else {
      return await createGoal(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  // Estatísticas
  const stats = {
    total: goals.length,
    completed: goals.filter(goal => getGoalProgress(goal).isCompleted).length,
    active: goals.filter(goal => {
      const progress = getGoalProgress(goal);
      return !progress.isCompleted && !progress.isOverdue;
    }).length,
    overdue: goals.filter(goal => getGoalProgress(goal).isOverdue).length
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
        <p className="text-red-600 dark:text-red-400">Erro ao carregar metas: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Minhas Metas
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed' | 'overdue')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as metas</option>
            <option value="active">Ativas</option>
            <option value="completed">Concluídas</option>
            <option value="overdue">Vencidas</option>
          </select>

          {/* Limpar filtros */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Lista de Metas */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {goals.length === 0 
              ? 'Nenhuma meta encontrada. Crie sua primeira meta!'
              : 'Nenhuma meta corresponde aos filtros aplicados.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={getGoalProgress(goal)}
              onEdit={() => handleEdit(goal)}
              onDelete={() => setDeleteConfirm(goal.id)}
              onUpdateProgress={() => handleUpdateProgress(goal)}
            />
          ))}
        </div>
      )}

      {/* Formulário */}
      <GoalForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingGoal ? {
          name: editingGoal.name,
          target_amount: editingGoal.target_amount,
          current_amount: editingGoal.current_amount,
          target_date: editingGoal.target_date,
          description: editingGoal.description
        } : undefined}
        title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
      />

      {/* Modal de Progresso */}
      {progressGoal && (
        <GoalProgressModal
          isOpen={true}
          onClose={() => setProgressGoal(null)}
          goal={progressGoal}
          onUpdateProgress={updateGoalProgress}
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
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
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