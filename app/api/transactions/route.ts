import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/firestore-utils'
import { TransactionCreate, ApiResponse, Transaction } from '@/types'
import { FieldValue } from 'firebase-admin/firestore'

// GET - Listar transações com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const categoria = searchParams.get('categoria')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')
    const limite = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'user_id é obrigatório'
      }, { status: 400 })
    }

    let query = adminDb.collection(COLLECTIONS.TRANSACTIONS)
      .where('user_id', '==', userId)

    if (categoria) {
      query = query.where('categoria', '==', categoria)
    }

    if (dataInicio && dataFim) {
      query = query
        .where('data', '>=', dataInicio)
        .where('data', '<=', dataFim)
    }

    query = query
      .orderBy('data', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limite)
      .offset(offset)

    const snapshot = await query.get()

    const transactions: Transaction[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction))

    return NextResponse.json<ApiResponse<Transaction[]>>({
      success: true,
      data: transactions
    })

  } catch (error: unknown) {
    console.error('Erro ao listar transações:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erro ao listar transações',
    }, { status: 500 })
  }
}

// POST - Criar nova transação
export async function POST(request: NextRequest) {
  try {
    const body: TransactionCreate = await request.json()

    // Validações
    if (!body.user_id || !body.valor || !body.categoria || !body.descricao || !body.data) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Dados incompletos',
        message: 'Todos os campos são obrigatórios: user_id, valor, categoria, descricao, data'
      }, { status: 400 })
    }

    if (body.valor <= 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Valor inválido',
        message: 'O valor deve ser maior que zero'
      }, { status: 400 })
    }

    // Criar transação
    const transactionsRef = adminDb.collection(COLLECTIONS.TRANSACTIONS)
    const newTransactionRef = await transactionsRef.add({
      user_id: body.user_id,
      valor: body.valor,
      categoria: body.categoria,
      descricao: body.descricao,
      data: body.data,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    })

    const newTransactionDoc = await newTransactionRef.get()
    const transaction: Transaction = {
      id: newTransactionDoc.id,
      ...newTransactionDoc.data(),
    } as Transaction

    return NextResponse.json<ApiResponse<Transaction>>({
      success: true,
      data: transaction,
      message: 'Transação criada com sucesso'
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('Erro ao criar transação:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erro ao criar transação',
    }, { status: 500 })
  }
}
