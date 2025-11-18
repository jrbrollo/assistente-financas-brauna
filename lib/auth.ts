// Utilities de autenticação simplificadas para MVP

export function getAuthUser() {
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
