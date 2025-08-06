import React from 'react';
import { useAccounts } from '../../hooks/useAccounts';

export default function AccountList() {
  const { accounts, loading } = useAccounts();

  if (loading) {
    return <div>Carregando contas...</div>;
  }

  return (
    <div className="space-y-4">
      {accounts.map(account => (
        <div key={account.id} className="p-4 bg-white rounded-md shadow-sm border border-gray-300">
          <h3 className="text-lg font-bold">{account.bank_name}</h3>
          <p>Número da Conta: {account.account_number}</p>
          <p>Tipo: {account.account_type === 'checking' ? 'Conta Corrente' : 'Conta Poupança'}</p>
          <p>Saldo: R$ {account.balance.toLocaleString('pt-BR')}</p>
        </div>
      ))}
    </div>
  );
}
