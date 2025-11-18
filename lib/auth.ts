// Utilities de autenticação simplificadas para MVP
// Usando localStorage para MVP. Para produção, considere usar Firebase Auth completo.

export interface AuthUser {
  id: string
  telefone: string
  nome: string
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const userId = localStorage.getItem('user_id')
  const userPhone = localStorage.getItem('user_phone')
  const userName = localStorage.getItem('user_name')

  if (!userId) return null

  return {
    id: userId,
    telefone: userPhone || '',
    nome: userName || 'Usuário',
  }
}

export function setAuthUser(user: AuthUser) {
  if (typeof window === 'undefined') return

  localStorage.setItem('user_id', user.id)
  localStorage.setItem('user_phone', user.telefone)
  localStorage.setItem('user_name', user.nome)
}

export function logout() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('user_id')
  localStorage.removeItem('user_phone')
  localStorage.removeItem('user_name')

  window.location.href = '/login'
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('user_id')
}
