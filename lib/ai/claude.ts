import Anthropic from '@anthropic-ai/sdk'
import { MessageData } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Investimentos',
  'Educação',
  'Compras',
  'Outros'
]

const SYSTEM_PROMPT = `Você é um assistente financeiro que processa mensagens de gastos pessoais.

Sua tarefa é extrair as seguintes informações de mensagens de texto:
1. Valor do gasto (número em reais)
2. Categoria (escolha a mais adequada entre: ${CATEGORIAS.join(', ')})
3. Descrição resumida do gasto
4. Data (se mencionada, caso contrário use a data atual)

Responda APENAS com um JSON válido no formato:
{
  "valor": number,
  "categoria": string,
  "descricao": string,
  "data": "YYYY-MM-DD"
}

Exemplos:
Mensagem: "Gastei 50 reais no almoço"
Resposta: {"valor": 50, "categoria": "Alimentação", "descricao": "Almoço", "data": "2025-11-18"}

Mensagem: "Paguei 120 de uber hoje"
Resposta: {"valor": 120, "categoria": "Transporte", "descricao": "Corrida de Uber", "data": "2025-11-18"}

Mensagem: "Comprei remédio na farmácia, 85 reais"
Resposta: {"valor": 85, "categoria": "Saúde", "descricao": "Remédio", "data": "2025-11-18"}

Se a mensagem não contiver informação de gasto, responda com:
{"error": "Não foi possível identificar um gasto na mensagem"}
`

export async function processExpenseMessage(
  message: string,
  currentDate: string = new Date().toISOString().split('T')[0]
): Promise<MessageData | { error: string }> {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Data atual: ${currentDate}\n\nMensagem: "${message}"`
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text)

      if (parsed.error) {
        return { error: parsed.error }
      }

      return {
        valor: parsed.valor,
        categoria: parsed.categoria,
        descricao: parsed.descricao,
        data: parsed.data
      }
    }

    return { error: 'Resposta inválida da IA' }
  } catch (error) {
    console.error('Erro ao processar mensagem com Claude:', error)
    return { error: 'Erro ao processar mensagem' }
  }
}

export async function generateExpenseSummary(
  transactions: Array<{ valor: number; categoria: string; descricao: string; data: string }>,
  period: string
): Promise<string> {
  try {
    const total = transactions.reduce((sum, t) => sum + t.valor, 0)
    const categorias = transactions.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor
      return acc
    }, {} as Record<string, number>)

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Crie um resumo amigável e conciso dos gastos ${period} em português do Brasil.

Total gasto: R$ ${total.toFixed(2)}
Número de transações: ${transactions.length}

Gastos por categoria:
${Object.entries(categorias)
  .map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`)
  .join('\n')}

O resumo deve:
1. Ser informal e amigável
2. Destacar a categoria com maior gasto
3. Mencionar o total gasto
4. Ser breve (máximo 3-4 linhas)
5. Incluir um emoji relevante`
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }

    return `Resumo ${period}:\nTotal: R$ ${total.toFixed(2)}\nTransações: ${transactions.length}`
  } catch (error) {
    console.error('Erro ao gerar resumo:', error)
    return `Resumo ${period}:\nTotal: R$ ${total.toFixed(2)}\nTransações: ${transactions.length}`
  }
}
