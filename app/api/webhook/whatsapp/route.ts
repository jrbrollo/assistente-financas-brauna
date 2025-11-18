import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/firestore-utils'
import { processExpenseMessage, generateExpenseSummary } from '@/lib/ai/claude'
import { WhatsAppWebhook } from '@/types'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FieldValue } from 'firebase-admin/firestore'

// Função para enviar mensagem de volta via Evolution API
async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          number: phone,
          text: message,
        }),
      }
    )

    if (!response.ok) {
      console.error('Erro ao enviar mensagem WhatsApp:', await response.text())
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
  }
}

// Função para obter ou criar usuário
async function getOrCreateUser(phone: string, name: string) {
  // Limpar número de telefone (remover caracteres especiais)
  const cleanPhone = phone.replace(/\D/g, '')

  // Verificar se usuário existe
  const usersRef = adminDb.collection(COLLECTIONS.USERS)
  const userQuery = await usersRef.where('telefone', '==', cleanPhone).limit(1).get()

  if (!userQuery.empty) {
    const userDoc = userQuery.docs[0]
    return {
      id: userDoc.id,
      ...userDoc.data(),
    }
  }

  // Criar novo usuário
  const newUserRef = await usersRef.add({
    nome: name || 'Usuário WhatsApp',
    telefone: cleanPhone,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  })

  const newUserDoc = await newUserRef.get()
  return {
    id: newUserDoc.id,
    ...newUserDoc.data(),
  }
}

// Função para processar comandos
async function handleCommand(command: string, userId: string, phone: string) {
  const lowerCommand = command.toLowerCase().trim()

  if (lowerCommand.includes('gastos da semana') || lowerCommand.includes('semana')) {
    const startDate = startOfWeek(new Date(), { locale: ptBR })
    const endDate = endOfWeek(new Date(), { locale: ptBR })

    const transactionsRef = adminDb.collection(COLLECTIONS.TRANSACTIONS)
    const snapshot = await transactionsRef
      .where('user_id', '==', userId)
      .where('data', '>=', format(startDate, 'yyyy-MM-dd'))
      .where('data', '<=', format(endDate, 'yyyy-MM-dd'))
      .orderBy('data', 'desc')
      .get()

    if (snapshot.empty) {
      await sendWhatsAppMessage(phone, '📊 Você não tem gastos registrados nesta semana.')
      return true
    }

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]

    const summary = await generateExpenseSummary(transactions, 'da semana')
    await sendWhatsAppMessage(phone, summary)
    return true
  }

  if (lowerCommand.includes('gastos do mês') || lowerCommand.includes('mês') || lowerCommand.includes('mes')) {
    const startDate = startOfMonth(new Date())
    const endDate = endOfMonth(new Date())

    const transactionsRef = adminDb.collection(COLLECTIONS.TRANSACTIONS)
    const snapshot = await transactionsRef
      .where('user_id', '==', userId)
      .where('data', '>=', format(startDate, 'yyyy-MM-dd'))
      .where('data', '<=', format(endDate, 'yyyy-MM-dd'))
      .orderBy('data', 'desc')
      .get()

    if (snapshot.empty) {
      await sendWhatsAppMessage(phone, '📊 Você não tem gastos registrados neste mês.')
      return true
    }

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]

    const summary = await generateExpenseSummary(transactions, 'do mês')
    await sendWhatsAppMessage(phone, summary)
    return true
  }

  if (lowerCommand.includes('resumo') || lowerCommand.includes('total')) {
    const startDate = startOfMonth(new Date())
    const endDate = endOfMonth(new Date())

    const transactionsRef = adminDb.collection(COLLECTIONS.TRANSACTIONS)
    const snapshot = await transactionsRef
      .where('user_id', '==', userId)
      .where('data', '>=', format(startDate, 'yyyy-MM-dd'))
      .where('data', '<=', format(endDate, 'yyyy-MM-dd'))
      .get()

    if (snapshot.empty) {
      await sendWhatsAppMessage(phone, '📊 Você ainda não tem gastos registrados.')
      return true
    }

    const transactions = snapshot.docs.map(doc => doc.data()) as any[]

    const total = transactions.reduce((sum, t) => sum + Number(t.valor), 0)
    const categorias = transactions.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor)
      return acc
    }, {} as Record<string, number>)

    const categoriasText = Object.entries(categorias)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, val]) => `  • ${cat}: R$ ${val.toFixed(2)}`)
      .join('\n')

    const message = `📊 *Resumo do mês:*\n\n💰 Total: R$ ${total.toFixed(2)}\n📝 Transações: ${transactions.length}\n\n*Por categoria:*\n${categoriasText}`

    await sendWhatsAppMessage(phone, message)
    return true
  }

  if (lowerCommand.includes('ajuda') || lowerCommand.includes('help') || lowerCommand === 'oi' || lowerCommand === 'olá') {
    const helpMessage = `👋 Olá! Eu sou seu assistente financeiro.\n\n📝 *Como registrar gastos:*\nBasta enviar uma mensagem como:\n"Gastei 50 reais no almoço"\n"Paguei 120 de uber"\n"Comprei remédio, 85 reais"\n\n📊 *Comandos disponíveis:*\n• "Gastos da semana"\n• "Gastos do mês"\n• "Resumo"\n\nEstou aqui para ajudar! 💙`

    await sendWhatsAppMessage(phone, helpMessage)
    return true
  }

  return false // Não é um comando conhecido
}

export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppWebhook = await request.json()

    // Ignorar mensagens enviadas pelo próprio bot
    if (body.data.key.fromMe) {
      return NextResponse.json({ success: true, message: 'Mensagem própria ignorada' })
    }

    // Extrair informações da mensagem
    const phone = body.data.key.remoteJid.replace('@s.whatsapp.net', '')
    const senderName = body.data.pushName || 'Usuário'
    const messageText = body.data.message?.conversation || body.data.message?.extendedTextMessage?.text

    if (!messageText) {
      return NextResponse.json({ success: true, message: 'Mensagem sem texto' })
    }

    console.log(`Mensagem recebida de ${phone}: ${messageText}`)

    // Obter ou criar usuário
    const user = await getOrCreateUser(phone, senderName)

    // Verificar se é um comando
    const isCommand = await handleCommand(messageText, user.id, phone)
    if (isCommand) {
      return NextResponse.json({ success: true, message: 'Comando processado' })
    }

    // Processar mensagem como gasto usando IA
    const result = await processExpenseMessage(messageText)

    if ('error' in result) {
      await sendWhatsAppMessage(
        phone,
        `❌ ${result.error}\n\nTente algo como: "Gastei 50 reais no almoço"\n\nOu envie "ajuda" para ver os comandos disponíveis.`
      )
      return NextResponse.json({ success: false, error: result.error })
    }

    // Salvar transação no Firestore
    const transactionsRef = adminDb.collection(COLLECTIONS.TRANSACTIONS)
    const newTransactionRef = await transactionsRef.add({
      user_id: user.id,
      valor: result.valor,
      categoria: result.categoria,
      descricao: result.descricao,
      data: result.data,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    })

    const newTransactionDoc = await newTransactionRef.get()
    const transaction = {
      id: newTransactionDoc.id,
      ...newTransactionDoc.data(),
    }

    // Enviar confirmação
    const confirmMessage = `✅ *Gasto registrado!*\n\n💰 Valor: R$ ${result.valor.toFixed(2)}\n📂 Categoria: ${result.categoria}\n📝 Descrição: ${result.descricao}\n📅 Data: ${format(new Date(result.data), "dd/MM/yyyy", { locale: ptBR })}`

    await sendWhatsAppMessage(phone, confirmMessage)

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
