import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthForm from './components/Auth/AuthForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import FinancialSummary from './components/Dashboard/FinancialSummary';
import RecentTransactions from './components/Dashboard/RecentTransactions';
import ExpenseChart from './components/Dashboard/ExpenseChart';
import GoalList from './components/Goals/GoalList';
import CardList from './components/Cards/CardList';
import TransactionList from './components/Transactions/TransactionList';
import PlanningList from './components/Planning/PlanningList';
import CouplesDashboard from './components/Couples/CouplesDashboard';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
      
      case 'planning':
        return <PlanningList />;
      
      case 'goals':
        return (
          <GoalList />
        );
      
      case 'couple':
        return <CouplesDashboard />;
      
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
