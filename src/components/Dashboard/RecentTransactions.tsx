import React from 'react';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';

interface TransactionActionsProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

function TransactionActions({ transaction, onEdit, onDelete }: TransactionActionsProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowActions(!showActions)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-400" />
      </button>
      
      {showActions && (
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <button
            onClick={() => {
              onEdit(transaction);
              setShowActions(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Edit2 className="h-3 w-3" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => {
              onDelete(transaction.id);
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
  );
}

export default function RecentTransactions() {
  const { transactions } = useTransactions();
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = (id: string) => {
    // Aqui você implementaria a lógica de exclusão
    console.log('Excluindo transação:', id);
    setShowDeleteConfirm(null);
  };

  const saveEdit = (updatedTransaction: Transaction) => {
    // Aqui você implementaria a lógica de edição
    console.log('Salvando transação:', updatedTransaction);
    setEditingTransaction(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Transações Recentes
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.category} • {new Date(transaction.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}
                    R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  
                  <TransactionActions
                    transaction={transaction}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium">
            Ver todas as transações
          </button>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Editar Transação
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveEdit(editingTransaction);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      description: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={Math.abs(editingTransaction.amount)}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      amount: editingTransaction.type === 'expense' ? -parseFloat(e.target.value) : parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.category}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      category: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
