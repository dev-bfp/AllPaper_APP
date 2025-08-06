import React from 'react';
import AccountForm from '../components/Accounts/AccountForm';
import AccountList from '../components/Accounts/AccountList';

export default function AccountsPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contas Bancárias</h1>
      <AccountForm />
      <AccountList />
    </div>
  );
}
