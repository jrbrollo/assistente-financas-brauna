import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/firestore-utils'
import { Transaction } from '@/types'
import { format } from 'date-fns'

// GET - Exportar transações para CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const categoria = searchParams.get('categoria')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')
    const formatType = searchParams.get('format') || 'csv'

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'user_id é obrigatório'
      }, { status: 400 })
    }

    // Buscar transações
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

    query = query.orderBy('data', 'desc').orderBy('created_at', 'desc')

    const snapshot = await query.get()

    const transactions: Transaction[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction))

    if (transactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma transação encontrada para exportar'
      }, { status: 404 })
    }

    // Gerar CSV
    if (formatType === 'csv') {
      const headers = ['Data', 'Categoria', 'Descrição', 'Valor']
      const csvRows = [headers.join(',')]

      transactions.forEach(t => {
        const row = [
          t.data,
          t.categoria,
          `"${t.descricao}"`, // Aspas para proteção de vírgulas
          t.valor.toFixed(2).replace('.', ',')
        ]
        csvRows.push(row.join(','))
      })

      // Adicionar linha de total
      const total = transactions.reduce((sum, t) => sum + Number(t.valor), 0)
      csvRows.push('')
      csvRows.push(`TOTAL,,,"${total.toFixed(2).replace('.', ',')}"`)

      const csv = csvRows.join('\n')

      // Retornar CSV como download
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv"`,
        },
      })
    }

    // Gerar JSON (fallback)
    return NextResponse.json({
      success: true,
      data: transactions,
      summary: {
        total: transactions.reduce((sum, t) => sum + Number(t.valor), 0),
        quantidade: transactions.length
      }
    })

  } catch (error: unknown) {
    console.error('Erro ao exportar transações:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao exportar transações',
    }, { status: 500 })
  }
}
