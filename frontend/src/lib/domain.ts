import type {
  CategoriaDespesa,
  Plataforma,
  TipoAbastecimento,
  TipoCombustivel,
} from '@/types/models'

export type Opcao<T extends string> = { value: T; label: string }

export const PLATAFORMAS: Opcao<Plataforma>[] = [
  { value: 'uber', label: 'Uber' },
  { value: 'bolt', label: 'Bolt' },
  { value: 'outro', label: 'Outro' },
]

export const TIPOS_COMBUSTIVEL: Opcao<TipoCombustivel>[] = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'gasoleo', label: 'Gasóleo' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'hibrido', label: 'Híbrido' },
]

export const TIPOS_ABASTECIMENTO: Opcao<TipoAbastecimento>[] = [
  { value: 'combustivel', label: 'Combustível' },
  { value: 'eletrico', label: 'Elétrico' },
]

export const CATEGORIAS_DESPESA: Opcao<CategoriaDespesa>[] = [
  { value: 'aluguer', label: 'Aluguer' },
  { value: 'combustivel', label: 'Combustível' },
  { value: 'manutencao', label: 'Reparações' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'iuc', label: 'IUC' },
  { value: 'portagem', label: 'Via Verde' },
  { value: 'inspecao', label: 'Inspeção' },
  { value: 'caucao', label: 'Caução' },
  { value: 'comida', label: 'Comida' },
  { value: 'lavagem', label: 'Lavagem' },
  { value: 'outro', label: 'Outro' },
]

export const MOEDA_PADRAO = 'EUR'
export const LOCALE = 'pt-PT'

export function labelOf<T extends string>(options: Opcao<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value
}
