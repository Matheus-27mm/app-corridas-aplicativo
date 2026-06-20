import { AlertTriangle, Gauge, Play, Square } from 'lucide-react'
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
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { parseNum } from '@/lib/num'
import { sumBy } from '@/lib/period'
import { cn } from '@/lib/utils'
import { useData } from '@/store/data'

export function JornadaDia() {
  const jornadas = useData((s) => s.jornadas)
  const ganhos = useData((s) => s.ganhos)
  const abastecimentos = useData((s) => s.abastecimentos)
  const despesas = useData((s) => s.despesas)
  const abrirDia = useData((s) => s.abrirDia)
  const fecharDia = useData((s) => s.fecharDia)

  const hoje = todayISO()

  // Só pode existir um fluxo ativo: o dia em aberto mais antigo é o que tem de ser fechado.
  const jornadaAberta =
    [...jornadas].filter((j) => j.kmFim == null).sort((a, b) => a.data.localeCompare(b.data))[0] ?? null
  const jornadaHoje = jornadas.find((j) => j.data === hoje) ?? null
  const precisaFecharAnterior = jornadaAberta != null && jornadaAberta.data !== hoje

  const [abrirOpen, setAbrirOpen] = useState(false)
  const [fecharOpen, setFecharOpen] = useState(false)
  const [km, setKm] = useState('')

  const kmInicioAberta = jornadaAberta?.kmInicio ?? null
  const kmFimInvalido = kmInicioAberta != null && km !== '' && parseNum(km) < kmInicioAberta
  const kmRodadosPreview =
    kmInicioAberta != null && parseNum(km) > 0 && !kmFimInvalido ? parseNum(km) - kmInicioAberta : null

  // Resumo do dia a fechar (para não ser preciso mudar de ecrã para ver os ganhos).
  const diaData = jornadaAberta?.data ?? null
  const ganhosDia = diaData
    ? sumBy(ganhos.filter((x) => x.data === diaData), (x) => x.valorBruto + (x.gorjetas ?? 0))
    : 0
  const custosDia = diaData
    ? sumBy(abastecimentos.filter((x) => x.data === diaData), (x) => x.total) +
      sumBy(despesas.filter((x) => x.data === diaData), (x) => x.valor)
    : 0
  const lucroDia = ganhosDia - custosDia

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
    if (!jornadaAberta || parseNum(km) <= 0 || kmFimInvalido) return
    try {
      await fecharDia(jornadaAberta.id, Math.round(parseNum(km)))
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
            <p className="text-[11px] text-muted-foreground">
              {precisaFecharAnterior ? 'Tens um dia por fechar' : 'Hodómetro de hoje'}
            </p>
          </div>
        </div>

        {jornadaAberta ? (
          <Button
            size="sm"
            variant={precisaFecharAnterior ? 'default' : 'secondary'}
            onClick={() => {
              setKm('')
              setFecharOpen(true)
            }}
          >
            <Square className="size-4" /> Fechar dia
          </Button>
        ) : !jornadaHoje ? (
          <Button
            size="sm"
            onClick={() => {
              setKm('')
              setAbrirOpen(true)
            }}
          >
            <Play className="size-4" /> Iniciar dia
          </Button>
        ) : null}
      </div>

      {jornadaAberta ? (
        precisaFecharAnterior ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="text-xs text-foreground">
              Tens o dia <span className="font-semibold">{formatDate(jornadaAberta.data)}</span> por fechar.
              Fecha-o (preenche o km final) para poderes iniciar um novo dia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-secondary/50 py-2">
              <p className="text-[10px] text-muted-foreground">Km início</p>
              <p className="text-sm font-semibold tabular-nums">
                {jornadaAberta.kmInicio != null ? formatNumber(jornadaAberta.kmInicio, 0) : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 py-2">
              <p className="text-[10px] text-muted-foreground">Estado</p>
              <p className="text-sm font-semibold text-amber-500">Em curso</p>
            </div>
          </div>
        )
      ) : jornadaHoje ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-secondary/50 py-2">
            <p className="text-[10px] text-muted-foreground">Km início</p>
            <p className="text-sm font-semibold tabular-nums">
              {jornadaHoje.kmInicio != null ? formatNumber(jornadaHoje.kmInicio, 0) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 py-2">
            <p className="text-[10px] text-muted-foreground">Km fim</p>
            <p className="text-sm font-semibold tabular-nums">
              {jornadaHoje.kmFim != null ? formatNumber(jornadaHoje.kmFim, 0) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 py-2">
            <p className="text-[10px] text-muted-foreground">Rodados</p>
            <p className="text-sm font-bold tabular-nums text-emerald-500">
              {jornadaHoje.kmRodados != null ? `${formatNumber(jornadaHoje.kmRodados, 0)} km` : '—'}
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
            <DialogTitle>
              Fechar o dia{precisaFecharAnterior && diaData ? ` (${formatDate(diaData)})` : ''}
            </DialogTitle>
            <DialogDescription>
              {kmInicioAberta != null ? `Iniciaste em ${formatNumber(kmInicioAberta, 0)} km. ` : ''}
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
                  O km final deve ser maior ou igual ao inicial ({formatNumber(kmInicioAberta ?? 0, 0)}).
                </p>
              ) : kmRodadosPreview != null ? (
                <p className="px-1 text-xs text-emerald-500">
                  Vais registar {formatNumber(kmRodadosPreview, 0)} km rodados.
                </p>
              ) : null}
            </div>

            {/* Resumo do dia — evita ter de mudar de ecrã para ver os ganhos */}
            <div className="space-y-1 rounded-lg bg-secondary/40 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ganhos do dia</span>
                <span className="font-semibold tabular-nums">{formatCurrency(ganhosDia)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custos do dia</span>
                <span className="font-semibold tabular-nums">{formatCurrency(custosDia)}</span>
              </div>
              <div className="flex justify-between border-t border-border/30 pt-1">
                <span className="text-muted-foreground">Lucro do dia</span>
                <span className={cn('font-bold tabular-nums', lucroDia >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {formatCurrency(lucroDia)}
                </span>
              </div>
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
