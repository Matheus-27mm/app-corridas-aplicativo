import { FileText } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toLocalISO } from '@/lib/date'
import { formatCurrency, formatDate, getCurrencySymbol } from '@/lib/format'
import { parseNum } from '@/lib/num'
import { cn } from '@/lib/utils'
import { useData } from '@/store/data'
import type { CategoriaDespesa, Plataforma } from '@/types/models'

const RECEITAS: { key: string; label: string; plataforma: Plataforma }[] = [
  { key: 'uber', label: 'Uber', plataforma: 'uber' },
  { key: 'bolt', label: 'Bolt', plataforma: 'bolt' },
  { key: 'outras', label: 'Outras receitas', plataforma: 'outro' },
]

const CUSTOS: { key: string; label: string; categoria: CategoriaDespesa }[] = [
  { key: 'aluguer', label: 'Aluguer', categoria: 'aluguer' },
  { key: 'combustivel', label: 'Combustível / Carregamento', categoria: 'combustivel' },
  { key: 'viaVerde', label: 'Via Verde', categoria: 'portagem' },
  { key: 'caucao', label: 'Caução', categoria: 'caucao' },
  { key: 'seguros', label: 'Seguros', categoria: 'seguro' },
  { key: 'reparacoes', label: 'Reparações', categoria: 'manutencao' },
  { key: 'outros', label: 'Outros custos', categoria: 'outro' },
]

function semanaAnterior() {
  const now = new Date()
  const dow = (now.getDay() + 6) % 7 // 0 = segunda-feira
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow - 7)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  return { de: toLocalISO(monday), ate: toLocalISO(sunday) }
}

export function LancamentoSemanal() {
  const definicoes = useData((s) => s.definicoes)
  const addGanho = useData((s) => s.addGanho)
  const addDespesa = useData((s) => s.addDespesa)

  const [open, setOpen] = useState(false)
  const [de, setDe] = useState(() => semanaAnterior().de)
  const [ate, setAte] = useState(() => semanaAnterior().ate)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [aGuardar, setAGuardar] = useState(false)

  const simbolo = getCurrencySymbol(definicoes.moeda)
  const setVal = (k: string, v: string) => setValores((s) => ({ ...s, [k]: v }))

  const totalReceitas = RECEITAS.reduce((s, f) => s + parseNum(valores[f.key] || ''), 0)
  const totalCustos = CUSTOS.reduce((s, f) => s + parseNum(valores[f.key] || ''), 0)
  const liquido = totalReceitas - totalCustos
  const temAlgo = totalReceitas > 0 || totalCustos > 0

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!temAlgo || aGuardar) return
    const desc = `Semana ${formatDate(de)} – ${formatDate(ate)}`
    const ops: Promise<void>[] = []

    for (const f of RECEITAS) {
      const v = parseNum(valores[f.key] || '')
      if (v > 0) {
        ops.push(
          addGanho({
            data: ate,
            plataforma: f.plataforma,
            valorBruto: v,
            numCorridas: null,
            km: null,
            horas: null,
            gorjetas: null,
          }),
        )
      }
    }
    for (const f of CUSTOS) {
      const v = parseNum(valores[f.key] || '')
      if (v > 0) {
        ops.push(addDespesa({ data: ate, categoria: f.categoria, descricao: desc, valor: v }))
      }
    }

    setAGuardar(true)
    try {
      await Promise.all(ops)
      toast.success(`Semana lançada (${ops.length} ${ops.length === 1 ? 'registo' : 'registos'})`)
      setOpen(false)
      setValores({})
    } catch {
      // cada store já mostra o erro do registo que falhou
    } finally {
      setAGuardar(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 bg-card/60 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
        >
          <FileText className="size-4" /> Lançar semana (extrato)
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lançamento semanal</DialogTitle>
          <DialogDescription>
            Copia os valores do teu extrato semanal. Deixa a zero o que não tiveres.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                value={de}
                max={ate}
                onChange={(e) => setDe(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                value={ate}
                min={de}
                onChange={(e) => setAte(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-500">Receitas</p>
            {RECEITAS.map((f) => (
              <LinhaValor
                key={f.key}
                label={f.label}
                simbolo={simbolo}
                value={valores[f.key] || ''}
                onChange={(v) => setVal(f.key, v)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-400">Custos</p>
            {CUSTOS.map((f) => (
              <LinhaValor
                key={f.key}
                label={f.label}
                simbolo={simbolo}
                value={valores[f.key] || ''}
                onChange={(v) => setVal(f.key, v)}
              />
            ))}
          </div>

          <div className="space-y-1 rounded-lg bg-secondary/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receitas</span>
              <span className="tabular-nums text-emerald-500">{formatCurrency(totalReceitas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custos</span>
              <span className="tabular-nums text-red-400">−{formatCurrency(totalCustos)}</span>
            </div>
            <div className="flex justify-between border-t border-border/30 pt-1 font-semibold">
              <span>Líquido</span>
              <span className={cn('tabular-nums', liquido >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                {formatCurrency(liquido)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!temAlgo || aGuardar}>
              {aGuardar ? 'A guardar…' : 'Lançar semana'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LinhaValor({
  label,
  simbolo,
  value,
  onChange,
}: {
  label: string
  simbolo: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="flex-1 text-sm font-normal text-foreground">{label}</Label>
      <div className="relative w-28">
        <Input
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-7 text-right"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {simbolo}
        </span>
      </div>
    </div>
  )
}
