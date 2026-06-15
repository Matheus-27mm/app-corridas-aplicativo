import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import { MOEDA_PADRAO } from '@/lib/domain'
import type { Abastecimento, Carro, Definicoes, Despesa, Ganho } from '@/types/models'
import { toast } from 'sonner'

interface DataState {
  carros: Carro[]
  ganhos: Ganho[]
  abastecimentos: Abastecimento[]
  despesas: Despesa[]
  definicoes: Definicoes
  loading: boolean
  fetchData: () => Promise<void>
  addCarro: (carro: Omit<Carro, 'id'>) => Promise<void>
  addGanho: (ganho: Omit<Ganho, 'id'>) => Promise<void>
  addAbastecimento: (abastecimento: Omit<Abastecimento, 'id'>) => Promise<void>
  addDespesa: (despesa: Omit<Despesa, 'id'>) => Promise<void>
  removeCarro: (id: string) => Promise<void>
  removeGanho: (id: string) => Promise<void>
  removeAbastecimento: (id: string) => Promise<void>
  removeDespesa: (id: string) => Promise<void>
  updateCarro: (id: string, carro: Omit<Carro, 'id'>) => Promise<void>
  updateGanho: (id: string, ganho: Omit<Ganho, 'id'>) => Promise<void>
  updateAbastecimento: (id: string, abastecimento: Omit<Abastecimento, 'id'>) => Promise<void>
  updateDespesa: (id: string, despesa: Omit<Despesa, 'id'>) => Promise<void>
  updateDefinicoes: (def: Definicoes) => Promise<void>
}

export const useData = create<DataState>((set) => ({
  carros: [],
  ganhos: [],
  abastecimentos: [],
  despesas: [],
  definicoes: { moeda: MOEDA_PADRAO, metaDiaria: 80, metaMensal: 1800 },
  loading: false,

  fetchData: async () => {
    // Evitar chamadas se for token mock
    const token = localStorage.getItem('corrida_token')
    if (!token || token.startsWith('mock_')) return

    set({ loading: true })
    try {
      const [carros, ganhos, abastecimentos, despesas, definicoes] = await Promise.all([
        apiFetch<Carro[]>('/carros'),
        apiFetch<Ganho[]>('/ganhos'),
        apiFetch<Abastecimento[]>('/abastecimentos'),
        apiFetch<Despesa[]>('/despesas'),
        apiFetch<Definicoes>('/definicoes'),
      ])

      set({
        carros,
        ganhos,
        abastecimentos,
        despesas,
        definicoes,
        loading: false,
      })
    } catch (err: any) {
      set({ loading: false })
      console.error('Erro ao carregar dados:', err)
      toast.error('Erro ao descarregar dados do servidor.')
    }
  },

  addCarro: async (carro) => {
    try {
      const res = await apiFetch<Carro>('/carros', {
        method: 'POST',
        body: JSON.stringify(carro),
      })
      set((s) => ({ carros: [res, ...s.carros] }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar carro')
      throw err
    }
  },

  addGanho: async (ganho) => {
    try {
      const res = await apiFetch<Ganho>('/ganhos', {
        method: 'POST',
        body: JSON.stringify(ganho),
      })
      set((s) => ({ ganhos: [res, ...s.ganhos] }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar ganho')
      throw err
    }
  },

  addAbastecimento: async (abastecimento) => {
    try {
      const res = await apiFetch<Abastecimento>('/abastecimentos', {
        method: 'POST',
        body: JSON.stringify(abastecimento),
      })
      set((s) => ({ abastecimentos: [res, ...s.abastecimentos] }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar abastecimento')
      throw err
    }
  },

  addDespesa: async (despesa) => {
    try {
      const res = await apiFetch<Despesa>('/despesas', {
        method: 'POST',
        body: JSON.stringify(despesa),
      })
      set((s) => ({ despesas: [res, ...s.despesas] }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar despesa')
      throw err
    }
  },

  removeCarro: async (id) => {
    try {
      await apiFetch(`/carros/${id}`, { method: 'DELETE' })
      set((s) => ({ carros: s.carros.filter((x) => x.id !== id) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover carro')
      throw err
    }
  },

  removeGanho: async (id) => {
    try {
      await apiFetch(`/ganhos/${id}`, { method: 'DELETE' })
      set((s) => ({ ganhos: s.ganhos.filter((x) => x.id !== id) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover ganho')
      throw err
    }
  },

  removeAbastecimento: async (id) => {
    try {
      await apiFetch(`/abastecimentos/${id}`, { method: 'DELETE' })
      set((s) => ({ abastecimentos: s.abastecimentos.filter((x) => x.id !== id) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover abastecimento')
      throw err
    }
  },

  removeDespesa: async (id) => {
    try {
      await apiFetch(`/despesas/${id}`, { method: 'DELETE' })
      set((s) => ({ despesas: s.despesas.filter((x) => x.id !== id) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover despesa')
      throw err
    }
  },

  updateCarro: async (id, carro) => {
    try {
      const res = await apiFetch<Carro>(`/carros/${id}`, {
        method: 'PUT',
        body: JSON.stringify(carro),
      })
      set((s) => ({ carros: s.carros.map((x) => (x.id === id ? res : x)) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar carro')
      throw err
    }
  },

  updateGanho: async (id, ganho) => {
    try {
      const res = await apiFetch<Ganho>(`/ganhos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(ganho),
      })
      set((s) => ({ ganhos: s.ganhos.map((x) => (x.id === id ? res : x)) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar ganho')
      throw err
    }
  },

  updateAbastecimento: async (id, abastecimento) => {
    try {
      const res = await apiFetch<Abastecimento>(`/abastecimentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(abastecimento),
      })
      set((s) => ({ abastecimentos: s.abastecimentos.map((x) => (x.id === id ? res : x)) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar abastecimento')
      throw err
    }
  },

  updateDespesa: async (id, despesa) => {
    try {
      const res = await apiFetch<Despesa>(`/despesas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(despesa),
      })
      set((s) => ({ despesas: s.despesas.map((x) => (x.id === id ? res : x)) }))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar despesa')
      throw err
    }
  },

  updateDefinicoes: async (def) => {
    try {
      const res = await apiFetch<Definicoes>('/definicoes', {
        method: 'PUT',
        body: JSON.stringify(def),
      })
      set({ definicoes: res })
      toast.success('Definições atualizadas com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar definições')
      throw err
    }
  },
}))
