'use client'

import { Transaction, Category } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export default function TransactionList({ transactions, categories, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nenhuma transação encontrada
        </h3>
        <p className="text-gray-600">
          Envie uma mensagem no WhatsApp para registrar seu primeiro gasto!
        </p>
      </div>
    )
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.nome === categoryName)
    return category?.cor || '#A8DADC'
  }

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.nome === categoryName)
    return category?.icon || '📦'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Transações Recentes</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${getCategoryColor(transaction.categoria)}20` }}
                >
                  {getCategoryIcon(transaction.categoria)}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {transaction.descricao}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-sm font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${getCategoryColor(transaction.categoria)}20`,
                        color: getCategoryColor(transaction.categoria),
                      }}
                    >
                      {transaction.categoria}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(transaction.data), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    R$ {Number(transaction.valor).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(transaction.created_at), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>

                {(onEdit || onDelete) && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar transação"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir transação"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
