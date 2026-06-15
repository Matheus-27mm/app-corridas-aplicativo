// Modelo de dados — espelha as futuras tabelas do backend (FastAPI + PostgreSQL).
// Datas em strings ISO `AAAA-MM-DD`.

export type Plataforma = 'uber' | 'bolt' | 'outro'
export type TipoCombustivel = 'gasolina' | 'gasoleo' | 'eletrico' | 'hibrido'
export type TipoAbastecimento = 'combustivel' | 'eletrico'
export type CategoriaDespesa =
  | 'manutencao'
  | 'seguro'
  | 'iuc'
  | 'inspecao'
  | 'portagem'
  | 'comida'
  | 'lavagem'
  | 'outro'

export interface Carro {
  id: string
  marca: string
  modelo: string
  ano: number
  matricula: string
  tipo: TipoCombustivel
  consumoMedio: number | null
}

export interface Ganho {
  id: string
  data: string
  plataforma: Plataforma
  valorBruto: number
  numCorridas: number | null
  km: number | null
  horas: number | null
  gorjetas: number | null
}

export interface Abastecimento {
  id: string
  data: string
  tipo: TipoAbastecimento
  quantidade: number
  precoUnitario: number
  total: number
  kmConta: number | null
}

export interface Despesa {
  id: string
  data: string
  categoria: CategoriaDespesa
  descricao: string | null
  valor: number
}

export interface Definicoes {
  moeda: string
  metaDiaria: number | null
  metaMensal: number | null
}
