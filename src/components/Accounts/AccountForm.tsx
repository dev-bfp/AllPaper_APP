import React, { useState } from 'react';
import { useAccounts } from '../../hooks/useAccounts';

export default function AccountForm() {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addAccount } = useAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addAccount({
        bank_name: bankName,
        account_number: accountNumber,
        account_type: accountType,
        balance
      });
      setBankName('');
      setAccountNumber('');
      setAccountType('checking');
      setBalance(0);
    } catch (err: any) {
      setError('Erro ao adicionar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        required
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        placeholder="Nome do Banco"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      />
      <input
        type="text"
        required
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        placeholder="Número da Conta"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      />
      <select
        value={accountType}
        onChange={(e) => setAccountType(e.target.value as 'checking' | 'savings')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      >
        <option value="checking">Conta Corrente</option>
        <option value="savings">Conta Poupança</option>
      </select>
      <input
        type="number"
        required
        value={balance}
        onChange={(e) => setBalance(Number(e.target.value))}
        placeholder="Saldo Inicial"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      />
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
      >
        {loading ? 'Carregando...' : 'Adicionar Conta'}
      </button>
    </form>
  );
}
