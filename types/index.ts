export interface User {
  id: string
  nome: string
  telefone: string
  created_at: string
}

export interface Category {
  id: string
  nome: string
  cor: string
  icon?: string
}

export interface Transaction {
  id: string
  user_id: string
  valor: number
  categoria: string
  descricao: string
  data: string
  created_at: string
}

export interface MessageData {
  valor: number
  categoria: string
  descricao: string
  data: string
}

export interface WhatsAppWebhook {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    pushName: string
    message: {
      conversation?: string
      extendedTextMessage?: {
        text: string
      }
    }
    messageType: string
    messageTimestamp: number
  }
}

export interface DashboardStats {
  totalGastos: number
  totalTransacoes: number
  gastosPorCategoria: Array<{
    categoria: string
    total: number
    cor: string
  }>
  transacoesRecentes: Transaction[]
}
