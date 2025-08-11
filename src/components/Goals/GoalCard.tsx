import React from 'react';
import { Target, Calendar, Edit2, Trash2, MoreVertical, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { Goal } from '../../hooks/useGoals';

interface GoalCardProps {
  goal: Goal;
  progress: {
    progress: number;
    remainingAmount: number;
    daysRemaining: number;
    isCompleted: boolean;
    isOverdue: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateProgress?: () => void;
  ownerName?: string;
}

export default function GoalCard({
  goal,
  progress,
  onEdit,
  onDelete,
  onUpdateProgress,
  ownerName
}: GoalCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = () => {
    if (progress.isCompleted) return 'text-green-600 dark:text-green-400';
    if (progress.isOverdue) return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getProgressBarColor = () => {
    if (progress.isCompleted) return 'bg-green-600';
    if (progress.isOverdue) return 'bg-red-600';
    return 'bg-blue-600';
  };

  const getStatusIcon = () => {
    if (progress.isCompleted) return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (progress.isOverdue) return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
      {(onEdit || onDelete || onUpdateProgress) && (
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                {onUpdateProgress && !progress.isCompleted && (
                  <button
                    onClick={() => {
                      onUpdateProgress();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>Progresso</span>
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Editar</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${progress.isCompleted ? 'bg-green-50 dark:bg-green-900/20' : progress.isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            {getStatusIcon()}
          </div>
          <div className="pr-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
            )}
            {ownerName && ownerName !== 'Você' && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Meta de {ownerName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress.progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`${getProgressBarColor()} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progress.progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Atual</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatAmount(goal.current_amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 dark:text-gray-400">Meta</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatAmount(goal.target_amount)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {progress.daysRemaining > 0 
                  ? `${progress.daysRemaining} dias restantes` 
                  : progress.isCompleted 
                    ? 'Meta concluída!' 
                    : 'Meta vencida'
                }
              </span>
            </div>
            <span className={`font-medium ${getStatusColor()}`}>
              {progress.isCompleted 
                ? '🎉 Concluída!' 
                : `Faltam ${formatAmount(progress.remainingAmount)}`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
