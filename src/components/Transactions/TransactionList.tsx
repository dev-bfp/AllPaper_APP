import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Copy, 
  MoreVertical,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTransactions, Transaction, CreateTransactionData } from '../../hooks/useTransactions';
import TransactionForm from './TransactionForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TransactionList() {
  const { 
    transactions, 
    loading, 
    error, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction, 
    duplicateTransaction 
  } = useTransactions();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = !filterCategory || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Obter categorias únicas
  const categories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteTransaction(id);
    if (error) {
      alert(`Erro ao excluir: ${error}`);
    }
    setDeleteConfirm(null);
  };

  const handleDuplicate = async (transaction: Transaction) => {
    const { error } = await duplicateTransaction(transaction);
    if (error) {
      alert(`Erro ao duplicar: ${error}`);
    }
  };

  const handleFormSubmit = async (data: CreateTransactionData) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction.id, data);
    } else {
      return await createTransaction(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
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
        <p className="text-red-600 dark:text-red-400">Erro ao carregar transações: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transações
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Transação</span>
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
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          {/* Filtro por categoria */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Limpar filtros */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCategory('');
            }}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {transactions.length === 0 
                ? 'Nenhuma transação encontrada. Crie sua primeira transação!'
                : 'Nenhuma transação corresponde aos filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirm(id)}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formulário */}
      <TransactionForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction ? {
          card_id: editingTransaction.card_id,
          amount: editingTransaction.amount, // Corrected line
          description: editingTransaction.description,
          category: editingTransaction.category,
          type: editingTransaction.type,
          installments: editingTransaction.installments,
          current_installment: editingTransaction.current_installment,
          due_date: editingTransaction.due_date,
          is_recurring: editingTransaction.is_recurring
        } : undefined}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      />

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm && (
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

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (transaction: Transaction) => void;
}

function TransactionItem({ transaction, onEdit, onDelete, onDuplicate }: TransactionItemProps) {
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
    }).format(Math.abs(amount));
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              transaction.type === 'income' 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {transaction.type === 'income' ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {transaction.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(transaction.due_date)}</span>
                </span>
                <span>{transaction.category}</span>
                {transaction.card && (
                  <span className="flex items-center space-x-1">
                    <CreditCard className="h-3 w-3" />
                    <span>{transaction.card.name}</span>
                  </span>
                )}
                {transaction.installments && (
                  <span>
                    {transaction.current_installment || 1}/{transaction.installments}x
                  </span>
                )}
                {transaction.is_recurring && (
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                    Recorrente
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium ${
            transaction.type === 'income' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
          </span>

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
                    onDuplicate(transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Copy className="h-3 w-3" />
                  <span>Duplicar</span>
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
        </div>
      </div>
    </div>
  );
}
