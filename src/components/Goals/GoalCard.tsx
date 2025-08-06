import React from 'react';
import { Target, Calendar, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface GoalCardProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function GoalCard({ 
  name, 
  targetAmount, 
  currentAmount, 
  targetDate, 
  description,
  onEdit,
  onDelete
}: GoalCardProps) {
  const [showActions, setShowActions] = React.useState(false);
  const progress = (currentAmount / targetAmount) * 100;
  const remainingAmount = targetAmount - currentAmount;
  const daysRemaining = Math.ceil(
    (new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
      {(onEdit || onDelete) && (
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
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="pr-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{name}</h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Atual</p>
            <p className="font-medium text-gray-900 dark:text-white">
              R$ {currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 dark:text-gray-400">Meta</p>
            <p className="font-medium text-gray-900 dark:text-white">
              R$ {targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Meta vencida'}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              Faltam R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}