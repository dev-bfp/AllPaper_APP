import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTransactions } from '../../hooks/useTransactions';

export default function ExpenseChart() {
  const { transactions } = useTransactions();

  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = acc.find(c => c.name === t.category);
      if (category) {
        category.value += Math.abs(t.amount);
      } else {
        acc.push({ name: t.category, value: Math.abs(t.amount), color: getRandomColor() });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Despesas por Categoria
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                `R$ ${value.toLocaleString('pt-BR')}`, 
                'Valor'
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
