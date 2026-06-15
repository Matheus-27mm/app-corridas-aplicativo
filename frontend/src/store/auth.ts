import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export interface Utilizador {
  id: string
  nome: string
  email: string
}

export type Provedor = 'google' | 'apple'

interface AuthState {
  user: Utilizador | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (nome: string, email: string, password: string) => Promise<void>
  signInWithProvider: (provedor: Provedor) => void
  signOut: () => void
  checkAuth: () => Promise<void>
}

const getStoredUser = (): Utilizador | null => {
  try {
    const val = localStorage.getItem('corrida_user')
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export const useAuth = create<AuthState>((set) => ({
  user: getStoredUser(),
  loading: false,

  signInWithEmail: async (email, password) => {
    set({ loading: true })
    try {
      const res = await apiFetch<{ access_token: string; user: Utilizador }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('corrida_token', res.access_token)
      localStorage.setItem('corrida_user', JSON.stringify(res.user))
      set({ user: res.user, loading: false })
      toast.success('Sessão iniciada com sucesso!')
    } catch (err: any) {
      set({ loading: false })
      toast.error(err.message || 'Falha ao iniciar sessão.')
      throw err
    }
  },

  signUpWithEmail: async (nome, email, password) => {
    set({ loading: true })
    try {
      const res = await apiFetch<{ access_token: string; user: Utilizador }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, password }),
      })
      localStorage.setItem('corrida_token', res.access_token)
      localStorage.setItem('corrida_user', JSON.stringify(res.user))
      set({ user: res.user, loading: false })
      toast.success('Conta criada com sucesso!')
    } catch (err: any) {
      set({ loading: false })
      toast.error(err.message || 'Erro ao criar conta.')
      throw err
    }
  },

  signInWithProvider: (provedor) => {
    // Mantém mock para provedores
    const mockUser = provedor === 'google'
      ? { id: 'google_user', nome: 'Conta Google', email: 'utilizador@gmail.com' }
      : { id: 'apple_user', nome: 'Conta Apple', email: 'utilizador@icloud.com' }
    
    localStorage.setItem('corrida_token', 'mock_jwt_token_provider')
    localStorage.setItem('corrida_user', JSON.stringify(mockUser))
    set({ user: mockUser })
    toast.success('Sessão iniciada (Mock)!')
  },

  signOut: () => {
    localStorage.removeItem('corrida_token')
    localStorage.removeItem('corrida_user')
    set({ user: null })
    toast.success('Sessão terminada.')
  },

  checkAuth: async () => {
    const token = localStorage.getItem('corrida_token')
    if (!token) {
      set({ user: null })
      return
    }
    // Se for token do provedor mock, ignorar chamada real
    if (token.startsWith('mock_')) {
      return
    }
    try {
      const user = await apiFetch<Utilizador>('/auth/me')
      localStorage.setItem('corrida_user', JSON.stringify(user))
      set({ user })
    } catch {
      localStorage.removeItem('corrida_token')
      localStorage.removeItem('corrida_user')
      set({ user: null })
    }
  },
}))
