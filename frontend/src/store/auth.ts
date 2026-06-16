import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export interface Utilizador {
  id: string
  username: string
  primeiroNome: string
  sobrenome: string
  nome: string
  email: string
  dataNascimento?: string | null
}

export interface RegisterPayload {
  username: string
  primeiroNome: string
  sobrenome: string
  email: string
  dataNascimento: string
  password: string
}

export type Provedor = 'google' | 'apple'

interface AuthState {
  user: Utilizador | null
  loading: boolean
  signIn: (login: string, password: string) => Promise<void>
  signUp: (payload: RegisterPayload) => Promise<void>
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

  signIn: async (login, password) => {
    set({ loading: true })
    try {
      const res = await apiFetch<{ access_token: string; user: Utilizador }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
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

  signUp: async (payload) => {
    set({ loading: true })
    try {
      const res = await apiFetch<{ access_token: string; user: Utilizador }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
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
    // Mantém mock para provedores (OAuth real fica para depois).
    const mockUser: Utilizador =
      provedor === 'google'
        ? {
            id: 'google_user',
            username: 'conta_google',
            primeiroNome: 'Conta',
            sobrenome: 'Google',
            nome: 'Conta Google',
            email: 'utilizador@gmail.com',
          }
        : {
            id: 'apple_user',
            username: 'conta_apple',
            primeiroNome: 'Conta',
            sobrenome: 'Apple',
            nome: 'Conta Apple',
            email: 'utilizador@icloud.com',
          }

    localStorage.setItem('corrida_token', 'mock_jwt_token_provider')
    localStorage.setItem('corrida_user', JSON.stringify(mockUser))
    set({ user: mockUser })
    toast.success('Sessão iniciada (demo).')
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
