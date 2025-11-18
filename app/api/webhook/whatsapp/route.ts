import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { processExpenseMessage, generateExpenseSummary } from '@/lib/ai/claude'
import { WhatsAppWebhook } from '@/types'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('telefone', cleanPhone)
    .single()

  if (existingUser) {
    return existingUser
  }

  // Criar novo usuário
  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert([
      {
        nome: name || 'Usuário WhatsApp',
        telefone: cleanPhone,
      },
    ])
    .select()
    .single()

  if (createError) {
    console.error('Erro ao criar usuário:', createError)
    throw createError
  }

  return newUser
}

// Função para processar comandos
async function handleCommand(command: string, userId: string, phone: string) {
  const lowerCommand = command.toLowerCase().trim()

  if (lowerCommand.includes('gastos da semana') || lowerCommand.includes('semana')) {
    const startDate = startOfWeek(new Date(), { locale: ptBR })
    const endDate = endOfWeek(new Date(), { locale: ptBR })

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('data', format(startDate, 'yyyy-MM-dd'))
      .lte('data', format(endDate, 'yyyy-MM-dd'))
      .order('data', { ascending: false })

    if (!transactions || transactions.length === 0) {
      await sendWhatsAppMessage(phone, '📊 Você não tem gastos registrados nesta semana.')
      return
    }

    const summary = await generateExpenseSummary(transactions, 'da semana')
    await sendWhatsAppMessage(phone, summary)
    return
  }

  if (lowerCommand.includes('gastos do mês') || lowerCommand.includes('mês') || lowerCommand.includes('mes')) {
    const startDate = startOfMonth(new Date())
    const endDate = endOfMonth(new Date())

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('data', format(startDate, 'yyyy-MM-dd'))
      .lte('data', format(endDate, 'yyyy-MM-dd'))
      .order('data', { ascending: false })

    if (!transactions || transactions.length === 0) {
      await sendWhatsAppMessage(phone, '📊 Você não tem gastos registrados neste mês.')
      return
    }

    const summary = await generateExpenseSummary(transactions, 'do mês')
    await sendWhatsAppMessage(phone, summary)
    return
  }

  if (lowerCommand.includes('resumo') || lowerCommand.includes('total')) {
    const startDate = startOfMonth(new Date())
    const endDate = endOfMonth(new Date())

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('data', format(startDate, 'yyyy-MM-dd'))
      .lte('data', format(endDate, 'yyyy-MM-dd'))

    if (!transactions || transactions.length === 0) {
      await sendWhatsAppMessage(phone, '📊 Você ainda não tem gastos registrados.')
      return
    }

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
    return
  }

  if (lowerCommand.includes('ajuda') || lowerCommand.includes('help') || lowerCommand === 'oi' || lowerCommand === 'olá') {
    const helpMessage = `👋 Olá! Eu sou seu assistente financeiro.\n\n📝 *Como registrar gastos:*\nBasta enviar uma mensagem como:\n"Gastei 50 reais no almoço"\n"Paguei 120 de uber"\n"Comprei remédio, 85 reais"\n\n📊 *Comandos disponíveis:*\n• "Gastos da semana"\n• "Gastos do mês"\n• "Resumo"\n\nEstou aqui para ajudar! 💙`

    await sendWhatsAppMessage(phone, helpMessage)
    return
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
    if (isCommand !== false) {
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

    // Salvar transação no banco
    const { data: transaction, error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          valor: result.valor,
          categoria: result.categoria,
          descricao: result.descricao,
          data: result.data,
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Erro ao salvar transação:', dbError)
      await sendWhatsAppMessage(phone, '❌ Erro ao salvar gasto. Tente novamente.')
      return NextResponse.json({ success: false, error: dbError.message })
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
