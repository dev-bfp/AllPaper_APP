import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff, Edit2, Trash2, MoreVertical, Plus, Wallet } from 'lucide-react';
import { useCards } from '../../hooks/useCards';
import CardForm from './CardForm';
import { Card } from '../../types';

interface CardActionsProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

function CardActions({ card, onEdit, onDelete }: CardActionsProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowActions(!showActions)}
        className="p-1 rounded hover:bg-white/20 transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-white/80" />
      </button>
      
      {showActions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowActions(false)}
          />
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <button
              onClick={() => {
                onEdit(card);
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Edit2 className="h-3 w-3" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                onDelete(card.id);
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Trash2 className="h-3 w-3" />
              <span>Excluir</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CardList() {
  const { cards, loading, createCard, updateCard, deleteCard } = useCards();
  const [showBalances, setShowBalances] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCreateCard = async (cardData: Omit<Card, 'id' | 'user_id' | 'created_at'>) => {
    const { error } = await createCard(cardData);
    if (error) {
      alert('Erro ao criar cartão/conta: ' + error);
    }
  };

  const handleUpdateCard = async (cardData: Omit<Card, 'id' | 'user_id' | 'created_at'>) => {
    if (!editingCard) return;
    
    const { error } = await updateCard(editingCard.id, cardData);
    if (error) {
      alert('Erro ao atualizar cartão/conta: ' + error);
    } else {
      setEditingCard(null);
    }
  };

  const handleDeleteCard = async (id: string) => {
    const { error } = await deleteCard(id);
    if (error) {
      alert('Erro ao excluir cartão/conta: ' + error);
    } else {
      setShowDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cartões e Contas
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showBalances ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span>{showBalances ? 'Ocultar' : 'Mostrar'} saldos</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <CreditCard className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum cartão ou conta cadastrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comece adicionando seus cartões de crédito e contas bancárias.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Adicionar Primeiro Cartão/Conta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`${
                  card.type === 'credit' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
                    : 'bg-gradient-to-br from-green-600 to-green-800'
                } rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow relative`}
              >
                <div className="absolute top-4 right-4">
                  <CardActions
                    card={card}
                    onEdit={setEditingCard}
                    onDelete={setShowDeleteConfirm}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {card.type === 'credit' ? (
                      <CreditCard className="h-6 w-6" />
                    ) : (
                      <Wallet className="h-6 w-6" />
                    )}
                    <span className="font-medium">{card.bank}</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full mr-8">
                    {card.type === 'credit' ? 'Crédito' : 'Conta/Débito'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm opacity-80">Nome</p>
                    <p className="font-medium">{card.name}</p>
                  </div>

                  <div>
                    <p className="text-sm opacity-80">Número</p>
                    <p className="font-mono text-lg">**** **** **** {card.last_four}</p>
                  </div>

                  {card.type === 'credit' && card.limit_amount && (
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs opacity-80">Limite</p>
                        <p className="font-medium">
                          {showBalances 
                            ? `R$ ${card.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                            : '****'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-80">Usado</p>
                        <p className="font-medium">
                          {showBalances 
                            ? `R$ ${(card.current_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                            : '****'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {card.type === 'debit' && (
                    <div>
                      <p className="text-xs opacity-80">Saldo Disponível</p>
                      <p className="font-medium text-lg">
                        {showBalances 
                          ? `R$ ${(card.current_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : '****'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário de novo cartão/conta */}
      <CardForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateCard}
        title="Adicionar Cartão/Conta"
      />

      {/* Formulário de edição */}
      {editingCard && (
        <CardForm
          isOpen={true}
          onClose={() => setEditingCard(null)}
          onSubmit={handleUpdateCard}
          initialData={editingCard}
          title="Editar Cartão/Conta"
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este cartão/conta? Esta ação não pode ser desfeita e todas as transações vinculadas serão desvinculadas.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCard(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}