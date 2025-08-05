import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Alimentação', value: 1200, color: '#EF4444' },
  { name: 'Transporte', value: 600, color: '#F97316' },
  { name: 'Moradia', value: 2000, color: '#EAB308' },
  { name: 'Entretenimento', value: 400, color: '#22C55E' },
  { name: 'Saúde', value: 300, color: '#3B82F6' },
  { name: 'Outros', value: 500, color: '#A855F7' },
];

export default function ExpenseChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Despesas por Categoria
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
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