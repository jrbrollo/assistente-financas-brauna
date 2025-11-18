'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Limpar telefone
      const cleanPhone = telefone.replace(/\D/g, '')

      if (cleanPhone.length < 10) {
        setError('Por favor, insira um telefone válido')
        setLoading(false)
        return
      }

      // Verificar se usuário existe
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('telefone', cleanPhone)
        .single()

      if (!user) {
        setError('Usuário não encontrado. Envie uma mensagem no WhatsApp para criar sua conta.')
        setLoading(false)
        return
      }

      // Salvar no localStorage (autenticação simplificada para MVP)
      localStorage.setItem('user_id', user.id)
      localStorage.setItem('user_phone', user.telefone)
      localStorage.setItem('user_name', user.nome)

      router.push('/dashboard')
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Assistente Financeiro Braúna
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Entre com seu telefone cadastrado no WhatsApp
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone (com DDD)
            </label>
            <input
              type="tel"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Primeira vez?</strong> Envie uma mensagem de gasto pelo WhatsApp para criar sua conta automaticamente!
          </p>
        </div>
      </div>
    </div>
  )
}
