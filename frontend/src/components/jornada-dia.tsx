import { Gauge, Play, Square } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { todayISO } from '@/lib/date'
import { formatNumber } from '@/lib/format'
import { parseNum } from '@/lib/num'
import { useData } from '@/store/data'

export function JornadaDia() {
  const jornadas = useData((s) => s.jornadas)
  const abrirDia = useData((s) => s.abrirDia)
  const fecharDia = useData((s) => s.fecharDia)

  const hoje = todayISO()
  const jornada = jornadas.find((j) => j.data === hoje)
  const kmInicio = jornada?.kmInicio ?? null

  const [abrirOpen, setAbrirOpen] = useState(false)
  const [fecharOpen, setFecharOpen] = useState(false)
  const [km, setKm] = useState('')

  const kmFimInvalido = kmInicio != null && km !== '' && parseNum(km) < kmInicio

  async function confirmarAbrir(e: FormEvent) {
    e.preventDefault()
    if (parseNum(km) <= 0) return
    try {
      await abrirDia(hoje, Math.round(parseNum(km)))
      setAbrirOpen(false)
      setKm('')
    } catch {
      // erro tratado no store (toast)
    }
  }

  async function confirmarFechar(e: FormEvent) {
    e.preventDefault()
    if (!jornada || parseNum(km) <= 0 || kmFimInvalido) return
    try {
      await fecharDia(jornada.id, Math.round(parseNum(km)))
      setFecharOpen(false)
      setKm('')
    } catch {
      // erro tratado no store (toast)
    }
  }

  return (
    <Card className="gap-3 p-4 border-border/40 bg-card/60">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rounded-xl border border-border/10 bg-secondary/80 p-2">
            <Gauge className="size-4 text-foreground" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Dia de trabalho</p>
            <p className="text-[11px] text-muted-foreground">Hodómetro de hoje</p>
          </div>
        </div>

        {!jornada ? (
          <Button size="sm" onClick={() => { setKm(''); setAbrirOpen(true) }}>
            <Play className="size-4" /> Iniciar dia
          </Button>
        ) : jornada.kmFim == null ? (
          <Button size="sm" variant="secondary" onClick={() => { setKm(''); setFecharOpen(true) }}>
            <Square className="size-4" /> Fechar dia
          </Button>
        ) : null}
      </div>

      {jornada ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-secondary/50 py-2">
            <p className="text-[10px] text-muted-foreground">Km início</p>
            <p className="text-sm font-semibold tabular-nums">
              {jornada.kmInicio != null ? formatNumber(jornada.kmInicio, 0) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 py-2">
            <p className="text-[10px] text-muted-foreground">Km fim</p>
            <p className="text-sm font-semibold tabular-nums">
              {jornada.kmFim != null ? formatNumber(jornada.kmFim, 0) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 py-2">
            <p className="text-[10px] text-muted-foreground">Rodados</p>
            <p className="text-sm font-bold tabular-nums text-emerald-500">
              {jornada.kmRodados != null ? `${formatNumber(jornada.kmRodados, 0)} km` : '—'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Regista o km do carro ao iniciar e ao fechar o dia para saber quanto rodaste.
        </p>
      )}

      {/* Iniciar dia */}
      <Dialog open={abrirOpen} onOpenChange={setAbrirOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar o dia</DialogTitle>
            <DialogDescription>Introduz o km atual do hodómetro do carro.</DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmarAbrir} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Km no início do dia</Label>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={parseNum(km) <= 0}>Iniciar dia</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fechar dia */}
      <Dialog open={fecharOpen} onOpenChange={setFecharOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar o dia</DialogTitle>
            <DialogDescription>
              {kmInicio != null ? `Iniciaste em ${formatNumber(kmInicio, 0)} km. ` : ''}
              Introduz o km final do hodómetro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmarFechar} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Km no fim do dia</Label>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                autoFocus
              />
              {kmFimInvalido ? (
                <p className="px-1 text-xs text-red-400">
                  O km final deve ser maior ou igual ao inicial ({formatNumber(kmInicio ?? 0, 0)}).
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={parseNum(km) <= 0 || kmFimInvalido}>Fechar dia</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
