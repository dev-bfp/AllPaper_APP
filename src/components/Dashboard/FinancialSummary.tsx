import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function SummaryCard({ title, value, change, changeType, icon }: SummaryCardProps) {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }[changeType];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className={`text-sm ${changeColor}`}>{change}</p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function FinancialSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SummaryCard
        title="Saldo Total"
        value="R$ 15.750"
        change="+5.2% este mês"
        changeType="positive"
        icon={<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
      />
      
      <SummaryCard
        title="Receitas"
        value="R$ 8.500"
        change="+2.1% este mês"
        changeType="positive"
        icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
      />
      
      <SummaryCard
        title="Despesas"
        value="R$ 4.250"
        change="-1.8% este mês"
        changeType="positive"
        icon={<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
      />
      
      <SummaryCard
        title="Metas Ativas"
        value="3"
        change="67% concluídas"
        changeType="neutral"
        icon={<Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
      />
    </div>
  );
}
