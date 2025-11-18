import OpenAI from 'openai'
import { MessageData } from '@/types'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Data atual: ${currentDate}\n\nMensagem: "${message}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return { error: 'Resposta vazia da IA' }
    }

    const parsed = JSON.parse(content)

    if (parsed.error) {
      return { error: parsed.error }
    }

    // Validações
    if (!parsed.valor || typeof parsed.valor !== 'number' || parsed.valor <= 0) {
      return { error: 'Valor inválido' }
    }

    if (!parsed.categoria || !CATEGORIAS.includes(parsed.categoria)) {
      return { error: 'Categoria inválida' }
    }

    if (!parsed.descricao || !parsed.data) {
      return { error: 'Dados incompletos' }
    }

    return {
      valor: parsed.valor,
      categoria: parsed.categoria,
      descricao: parsed.descricao,
      data: parsed.data
    }
  } catch (error) {
    console.error('Erro ao processar mensagem com OpenAI:', error)
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

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente financeiro amigável que cria resumos concisos de gastos em português do Brasil.'
        },
        {
          role: 'user',
          content: `Crie um resumo amigável e conciso dos gastos ${period}.

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
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      return content
    }

    return `Resumo ${period}:\nTotal: R$ ${total.toFixed(2)}\nTransações: ${transactions.length}`
  } catch (error) {
    console.error('Erro ao gerar resumo:', error)
    const total = transactions.reduce((sum, t) => sum + t.valor, 0)
    return `Resumo ${period}:\nTotal: R$ ${total.toFixed(2)}\nTransações: ${transactions.length}`
  }
}
