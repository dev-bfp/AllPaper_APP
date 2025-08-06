import React, { useState } from 'react';
import { Edit2, Trash2, Copy } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

const initialTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Compra no supermercado',
    amount: 150.75,
    date: '2024-04-01',
    category: 'Alimentação',
  },
  {
    id: '2',
    description: 'Pagamento de aluguel',
    amount: 1200,
    date: '2024-04-03',
    category: 'Moradia',
  },
  {
    id: '3',
    description: 'Cinema',
    amount: 45.50,
    date: '2024-04-05',
    category: 'Lazer',
  },
];

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const handleSave = (updated: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === updated.id ? updated : t))
    );
    setEditTransaction(null);
  };

  const handleDelete = (id: string) => {
    setDeleteTransactionId(id);
  };

  const confirmDelete = () => {
    if (deleteTransactionId) {
      setTransactions(prev => prev.filter(t => t.id !== deleteTransactionId));
      setDeleteTransactionId(null);
    }
  };

  const handleDuplicate = (transaction: Transaction) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [...prev, newTransaction]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transações</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Descrição</th>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Valor</th>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Data</th>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Categoria</th>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">{t.description}</td>
                <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">R$ {t.amount.toFixed(2)}</td>
                <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">{t.date}</td>
                <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">{t.category}</td>
                <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex space-x-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Editar"
                  >
                    <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(t)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Duplicar"
                  >
                    <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edição */}
      {editTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Editar Transação</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editTransaction);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={editTransaction.description}
                    onChange={(e) =>
                      setEditTransaction({ ...editTransaction, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTransaction.amount}
                    onChange={(e) =>
                      setEditTransaction({ ...editTransaction, amount: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={editTransaction.date}
                    onChange={(e) =>
                      setEditTransaction({ ...editTransaction, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={editTransaction.category}
                    onChange={(e) =>
                      setEditTransaction({ ...editTransaction, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditTransaction(null)}
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

      {/* Modal de confirmação de exclusão */}
      {deleteTransactionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteTransactionId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
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
