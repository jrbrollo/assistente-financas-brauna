// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  nome: string
  telefone: string
  email?: string
  created_at: string | Date
  updated_at?: string | Date
}

export interface UserCreate {
  nome: string
  telefone: string
  email?: string
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string
  nome: string
  cor: string  // Hex color: #RRGGBB
  icon?: string  // Emoji
  created_at?: string | Date
}

export type CategoryName =
  | 'Alimentação'
  | 'Transporte'
  | 'Moradia'
  | 'Saúde'
  | 'Lazer'
  | 'Investimentos'
  | 'Educação'
  | 'Compras'
  | 'Outros'

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: string
  user_id: string
  valor: number
  categoria: string
  descricao: string
  data: string  // YYYY-MM-DD
  created_at: string | Date
  updated_at?: string | Date
}

export interface TransactionCreate {
  user_id: string
  valor: number
  categoria: string
  descricao: string
  data: string
}

export interface TransactionUpdate {
  valor?: number
  categoria?: string
  descricao?: string
  data?: string
}

// ============================================
// AI MESSAGE PROCESSING
// ============================================

export interface MessageData {
  valor: number
  categoria: string
  descricao: string
  data: string
}

export interface MessageProcessingError {
  error: string
}

export type MessageProcessingResult = MessageData | MessageProcessingError

// ============================================
// WHATSAPP WEBHOOK
// ============================================

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

// ============================================
// DASHBOARD & STATS
// ============================================

export interface DashboardStats {
  totalGastos: number
  totalTransacoes: number
  mediaGasto: number
  gastosPorCategoria: CategoryExpense[]
  transacoesRecentes: Transaction[]
}

export interface CategoryExpense {
  categoria: string
  total: number
  cor: string
  quantidade: number
  percentual: number
}

export interface PeriodComparison {
  periodoAtual: {
    total: number
    transacoes: number
  }
  periodoAnterior: {
    total: number
    transacoes: number
  }
  variacao: {
    valor: number
    percentual: number
  }
}

// ============================================
// FILTER & PAGINATION
// ============================================

export interface TransactionFilters {
  categoria?: string
  dataInicio?: string
  dataFim?: string
  valorMin?: number
  valorMax?: number
  busca?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  success: false
  error: string
  message?: string
  code?: string
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  periodo: {
    inicio: string
    fim: string
  }
  categorias?: string[]
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isMessageData(obj: any): obj is MessageData {
  return (
    obj &&
    typeof obj.valor === 'number' &&
    typeof obj.categoria === 'string' &&
    typeof obj.descricao === 'string' &&
    typeof obj.data === 'string'
  )
}

export function isMessageError(obj: any): obj is MessageProcessingError {
  return obj && typeof obj.error === 'string'
}

export function isValidTransaction(obj: any): obj is Transaction {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.valor === 'number' &&
    obj.valor > 0 &&
    typeof obj.categoria === 'string' &&
    typeof obj.descricao === 'string' &&
    typeof obj.data === 'string'
  )
}
