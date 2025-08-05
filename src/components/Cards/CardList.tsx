import React from 'react';
import { CreditCard, Eye, EyeOff, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  lastFour: string;
  bank: string;
  limit?: number;
  currentBalance?: number;
}

const mockCards: Card[] = [
  {
    id: '1',
    name: 'Cartão Principal',
    type: 'credit',
    lastFour: '4532',
    bank: 'Nubank',
    limit: 5000,
    currentBalance: 1250
  },
  {
    id: '2',
    name: 'Conta Corrente',
    type: 'debit',
    lastFour: '7891',
    bank: 'Banco do Brasil',
    currentBalance: 3500
  }
];

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
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
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
      )}
    </div>
  );
}

export default function CardList() {
  const [showBalances, setShowBalances] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<Card | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  const handleEdit = (card: Card) => {
    setEditingCard(card);
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = (id: string) => {
    console.log('Excluindo cartão:', id);
    setShowDeleteConfirm(null);
  };

  const saveEdit = (updatedCard: Card) => {
    console.log('Salvando cartão:', updatedCard);
    setEditingCard(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meus Cartões
          </h2>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCards.map((card) => (
            <div
              key={card.id}
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <div className="absolute top-4 right-4">
                <CardActions
                  card={card}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6" />
                  <span className="font-medium">{card.bank}</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full mr-8">
                  {card.type === 'credit' ? 'Crédito' : 'Débito'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-80">Nome do Cartão</p>
                  <p className="font-medium">{card.name}</p>
                </div>

                <div>
                  <p className="text-sm opacity-80">Número</p>
                  <p className="font-mono text-lg">**** **** **** {card.lastFour}</p>
                </div>

                {card.type === 'credit' && (
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-80">Limite</p>
                      <p className="font-medium">
                        {showBalances 
                          ? `R$ ${card.limit?.toLocaleString('pt-BR')}` 
                          : '****'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80">Usado</p>
                      <p className="font-medium">
                        {showBalances 
                          ? `R$ ${card.currentBalance?.toLocaleString('pt-BR')}` 
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
                        ? `R$ ${card.currentBalance?.toLocaleString('pt-BR')}` 
                        : '****'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Adicionar Novo Cartão
        </button>
      </div>

      {/* Modal de Edição de Cartão */}
      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Editar Cartão
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveEdit(editingCard);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Cartão
                  </label>
                  <input
                    type="text"
                    value={editingCard.name}
                    onChange={(e) => setEditingCard({
                      ...editingCard,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={editingCard.bank}
                    onChange={(e) => setEditingCard({
                      ...editingCard,
                      bank: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {editingCard.type === 'credit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Limite
                    </label>
                    <input
                      type="number"
                      value={editingCard.limit || ''}
                      onChange={(e) => setEditingCard({
                        ...editingCard,
                        limit: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
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