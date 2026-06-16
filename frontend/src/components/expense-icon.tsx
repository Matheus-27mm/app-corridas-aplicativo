import {
  ClipboardCheck,
  Droplets,
  KeyRound,
  Landmark,
  Milestone,
  ShieldCheck,
  Tag,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type { CategoriaDespesa } from '@/types/models'

const ICONS: Record<CategoriaDespesa, LucideIcon> = {
  aluguer: KeyRound,
  manutencao: Wrench,
  seguro: ShieldCheck,
  iuc: Landmark,
  inspecao: ClipboardCheck,
  portagem: Milestone,
  comida: Utensils,
  lavagem: Droplets,
  outro: Tag,
}

export function ExpenseIcon({
  categoria,
  className,
}: {
  categoria: CategoriaDespesa
  className?: string
}) {
  const Icon = ICONS[categoria] ?? Tag
  return <Icon className={className} />
}
