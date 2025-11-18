'use client'

import { Transaction } from '@/types'

interface DeleteConfirmModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
  loading?: boolean
}

export default function DeleteConfirmModal({
  transaction,
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: DeleteConfirmModalProps) {
  if (!isOpen || !transaction) return null

  const handleConfirm = async () => {
    await onConfirm(transaction.id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Excluir Transação
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Descrição:</span>
              <span className="text-sm font-medium text-gray-900">{transaction.descricao}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Valor:</span>
              <span className="text-sm font-bold text-red-600">
                R$ {Number(transaction.valor).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Categoria:</span>
              <span className="text-sm font-medium text-gray-900">{transaction.categoria}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
