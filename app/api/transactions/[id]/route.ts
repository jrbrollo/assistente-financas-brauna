import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/firestore-utils'
import { TransactionUpdate, ApiResponse, Transaction } from '@/types'
import { FieldValue } from 'firebase-admin/firestore'

// GET - Obter transação específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transactionDoc = await adminDb
      .collection(COLLECTIONS.TRANSACTIONS)
      .doc(id)
      .get()

    if (!transactionDoc.exists) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Transação não encontrada'
      }, { status: 404 })
    }

    const transaction: Transaction = {
      id: transactionDoc.id,
      ...transactionDoc.data(),
    } as Transaction

    return NextResponse.json<ApiResponse<Transaction>>({
      success: true,
      data: transaction
    })

  } catch (error: unknown) {
    console.error('Erro ao buscar transação:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erro ao buscar transação'
    }, { status: 500 })
  }
}

// PATCH - Atualizar transação
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: TransactionUpdate = await request.json()

    // Validações
    if (body.valor !== undefined && body.valor <= 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Valor inválido',
        message: 'O valor deve ser maior que zero'
      }, { status: 400 })
    }

    // Verificar se transação existe
    const transactionRef = adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(id)
    const transactionDoc = await transactionRef.get()

    if (!transactionDoc.exists) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Transação não encontrada'
      }, { status: 404 })
    }

    // Atualizar apenas campos fornecidos
    const updateData: Record<string, unknown> = {
      updated_at: FieldValue.serverTimestamp()
    }

    if (body.valor !== undefined) updateData.valor = body.valor
    if (body.categoria !== undefined) updateData.categoria = body.categoria
    if (body.descricao !== undefined) updateData.descricao = body.descricao
    if (body.data !== undefined) updateData.data = body.data

    await transactionRef.update(updateData)

    // Retornar transação atualizada
    const updatedDoc = await transactionRef.get()
    const transaction: Transaction = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Transaction

    return NextResponse.json<ApiResponse<Transaction>>({
      success: true,
      data: transaction,
      message: 'Transação atualizada com sucesso'
    })

  } catch (error: unknown) {
    console.error('Erro ao atualizar transação:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erro ao atualizar transação'
    }, { status: 500 })
  }
}

// DELETE - Deletar transação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se transação existe
    const transactionRef = adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(id)
    const transactionDoc = await transactionRef.get()

    if (!transactionDoc.exists) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Transação não encontrada'
      }, { status: 404 })
    }

    // Deletar transação
    await transactionRef.delete()

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Transação deletada com sucesso'
    })

  } catch (error: unknown) {
    console.error('Erro ao deletar transação:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erro ao deletar transação'
    }, { status: 500 })
  }
}
