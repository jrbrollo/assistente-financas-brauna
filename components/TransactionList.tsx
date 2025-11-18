'use client'

import { Transaction, Category } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function TransactionList({ transactions, categories }: TransactionListProps) {
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

              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  R$ {Number(transaction.valor).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(transaction.created_at), 'HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
