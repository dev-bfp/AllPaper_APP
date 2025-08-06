import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthForm from './components/Auth/AuthForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import FinancialSummary from './components/Dashboard/FinancialSummary';
import RecentTransactions from './components/Dashboard/RecentTransactions';
import ExpenseChart from './components/Dashboard/ExpenseChart';
import GoalCard from './components/Goals/GoalCard';
import CardList from './components/Cards/CardList';
import TransactionList from './components/Transactions/TransactionList';
import { useCards } from './hooks/useCards';

function App() {
  const { user, loading } = useAuth();
  const { cards } = useCards();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [showGoalDeleteConfirm, setShowGoalDeleteConfirm] = useState<string | null>(null);

  const handleGoalEdit = (goal: any) => {
    setEditingGoal(goal);
  };

  const handleGoalDelete = (id: string) => {
    setShowGoalDeleteConfirm(id);
  };

  const confirmGoalDelete = (id: string) => {
    console.log('Excluindo meta:', id);
    setShowGoalDeleteConfirm(null);
  };

  const saveGoalEdit = (updatedGoal: any) => {
    console.log('Salvando meta:', updatedGoal);
    setEditingGoal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <FinancialSummary />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentTransactions />
              <ExpenseChart />
            </div>
          </div>
        );
      
      case 'cards':
        return <CardList />;
      
      case 'transactions':
        return <TransactionList />;
      
      case 'goals':
        return (
          <div className="space-y-6">
            {/* Modal de Edição de Meta */}
            {editingGoal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Editar Meta
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    saveGoalEdit(editingGoal);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nome da Meta
                        </label>
                        <input
                          type="text"
                          value={editingGoal.name}
                          onChange={(e) => setEditingGoal({
                            ...editingGoal,
                            name: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valor Alvo
                        </label>
                        <input
                          type="number"
                          value={editingGoal.targetAmount}
                          onChange={(e) => setEditingGoal({
                            ...editingGoal,
                            targetAmount: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Alvo
                        </label>
                        <input
                          type="date"
                          value={editingGoal.targetDate}
                          onChange={(e) => setEditingGoal({
                            ...editingGoal,
                            targetDate: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={editingGoal.description || ''}
                          onChange={(e) => setEditingGoal({
                            ...editingGoal,
                            description: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingGoal(null)}
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
            {showGoalDeleteConfirm && (
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
                      onClick={() => setShowGoalDeleteConfirm(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => confirmGoalDelete(showGoalDeleteConfirm)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Minhas Metas
              </h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Nova Meta
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GoalCard
                name="Reserva de Emergência"
                targetAmount={20000}
                currentAmount={12500}
                targetDate="2025-12-31"
                description="6 meses de gastos essenciais"
                onEdit={() => handleGoalEdit({
                  name: "Reserva de Emergência",
                  targetAmount: 20000,
                  currentAmount: 12500,
                  targetDate: "2025-12-31",
                  description: "6 meses de gastos essenciais"
                })}
                onDelete={() => handleGoalDelete("1")}
              />
              <GoalCard
                name="Viagem Europa"
                targetAmount={8000}
                currentAmount={3200}
                targetDate="2025-07-15"
                description="Lua de mel em Paris"
                onEdit={() => handleGoalEdit({
                  name: "Viagem Europa",
                  targetAmount: 8000,
                  currentAmount: 3200,
                  targetDate: "2025-07-15",
                  description: "Lua de mel em Paris"
                })}
                onDelete={() => handleGoalDelete("2")}
              />
              <GoalCard
                name="Carro Novo"
                targetAmount={45000}
                currentAmount={15000}
                targetDate="2026-03-01"
                description="SUV para a família"
                onEdit={() => handleGoalEdit({
                  name: "Carro Novo",
                  targetAmount: 45000,
                  currentAmount: 15000,
                  targetDate: "2026-03-01",
                  description: "SUV para a família"
                })}
                onDelete={() => handleGoalDelete("3")}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
