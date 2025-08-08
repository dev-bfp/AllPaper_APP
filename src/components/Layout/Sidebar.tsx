import React from 'react';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Calendar, 
  Settings,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'transactions', label: 'Transações', icon: TrendingUp },
  { id: 'cards', label: 'Cartões', icon: CreditCard },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'planning', label: 'Planejamento', icon: Calendar },
  { id: 'couple', label: 'Casal', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 h-full">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
