'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { COLLECTIONS, DEFAULT_CATEGORIES } from '@/lib/firebase/firestore-utils'
import { getAuthUser, logout } from '@/lib/auth'
import { Transaction, Category } from '@/types'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ExpenseChart from '@/components/ExpenseChart'
import TransactionList from '@/components/TransactionList'

type Period = 'week' | 'month' | 'all'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('month')
  const router = useRouter()

  useEffect(() => {
    const user = getAuthUser()
    if (!user) {
      router.push('/login')
      return
    }

    loadData(user.id)
  }, [router, period])

  const loadData = async (userId: string) => {
    setLoading(true)

    try {
      // Carregar categorias do Firestore (ou usar padrões se não existir)
      const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
      const categoriesSnapshot = await getDocs(categoriesRef)

      if (!categoriesSnapshot.empty) {
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[]
        setCategories(categoriesData)
      } else {
        // Usar categorias padrão se não existirem no banco
        setCategories(DEFAULT_CATEGORIES.map((cat, idx) => ({
          id: `cat-${idx}`,
          ...cat
        })))
      }

      // Determinar intervalo de datas
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (period === 'week') {
        startDate = startOfWeek(new Date(), { locale: ptBR })
        endDate = endOfWeek(new Date(), { locale: ptBR })
      } else if (period === 'month') {
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
      }

      // Carregar transações do Firestore
      const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS)
      let q = query(transactionsRef, where('user_id', '==', userId))

      if (startDate && endDate) {
        q = query(
          transactionsRef,
          where('user_id', '==', userId),
          where('data', '>=', format(startDate, 'yyyy-MM-dd')),
          where('data', '<=', format(endDate, 'yyyy-MM-dd')),
          orderBy('data', 'desc')
        )
      } else {
        q = query(
          transactionsRef,
          where('user_id', '==', userId),
          orderBy('data', 'desc')
        )
      }

      const transactionsSnapshot = await getDocs(q)
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]

      setTransactions(transactionsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const user = getAuthUser()
  if (!user) return null

  const totalGastos = transactions.reduce((sum, t) => sum + Number(t.valor), 0)

  const gastosPorCategoria = transactions.reduce((acc, t) => {
    const categoria = categories.find(c => c.nome === t.categoria)
    const existing = acc.find(item => item.categoria === t.categoria)

    if (existing) {
      existing.total += Number(t.valor)
    } else {
      acc.push({
        categoria: t.categoria,
        total: Number(t.valor),
        cor: categoria?.cor || '#A8DADC',
      })
    }

    return acc
  }, [] as Array<{ categoria: string; total: number; cor: string }>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Olá, {user.nome}! 👋</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtro de período */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Total Gasto</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  R$ {totalGastos.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Transações</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {transactions.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Média por Transação</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  R$ {transactions.length > 0 ? (totalGastos / transactions.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            {transactions.length > 0 && (
              <ExpenseChart data={gastosPorCategoria} />
            )}

            {/* Lista de transações */}
            <TransactionList transactions={transactions} categories={categories} />
          </>
        )}
      </main>
    </div>
  )
}
