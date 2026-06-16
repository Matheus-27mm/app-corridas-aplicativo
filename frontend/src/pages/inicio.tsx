import { useState, useMemo, useEffect } from 'react'
import { JornadaDia } from '@/components/jornada-dia'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { filterByPeriod, filterByRange, type Period, sumBy } from '@/lib/period'
import { cn } from '@/lib/utils'
import { useData } from '@/store/data'
import { Sparkles, TrendingUp, TrendingDown, Fuel, Zap, RefreshCw, CalendarRange } from 'lucide-react'
import { todayISO, toLocalISO } from '@/lib/date'
import { apiFetch } from '@/lib/api'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="flex flex-col gap-1 p-4 bg-card border-border/40">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold tabular-nums text-foreground">{value}</span>
      {sub ? <span className="text-[10px] text-muted-foreground/85 truncate">{sub}</span> : null}
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-muted rounded"></div>
      <div className="h-5 w-48 bg-muted rounded mb-4"></div>
      <div className="h-10 w-full bg-muted rounded"></div>
      <div className="h-28 w-full bg-muted rounded"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
      <div className="h-28 w-full bg-muted rounded"></div>
    </div>
  )
}

interface PlataformaResumo {
  plataforma: string
  ganhos: number
  corridas: number
  km: number
  horas: number
  ganhosPorHora: number | null
  ganhosPorKm: number | null
}

interface Resumo {
  periodo: string
  inicio?: string | null
  fim?: string | null
  ganhos: number
  custos: number
  lucro: number
  km: number
  horas: number
  corridas: number
  kmRodados?: number | null
  lucroPorKm: number | null
  lucroPorHora: number | null
  plataformas: PlataformaResumo[]
}

export function InicioPage() {
  const { ganhos, abastecimentos, despesas, definicoes, loading, carros } = useData()
  const [periodo, setPeriodo] = useState<Period | 'personalizado'>('hoje')
  const [rangeInicio, setRangeInicio] = useState(todayISO())
  const [rangeFim, setRangeFim] = useState(todayISO())
  const isCustom = periodo === 'personalizado'
  const resumoQuery = isCustom ? `inicio=${rangeInicio}&fim=${rangeFim}` : `periodo=${periodo}`
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [resumoLoading, setResumoLoading] = useState(true)

  const token = localStorage.getItem('corrida_token')
  const isMock = !token || token.startsWith('mock_')

  useEffect(() => {
    let active = true
    async function loadResumo() {
      if (!token || token.startsWith('mock_')) {
        setResumoLoading(false)
        return
      }
      setResumoLoading(true)
      try {
        const data = await apiFetch<Resumo>(`/resumo?${resumoQuery}`)
        if (active) {
          setResumo(data)
          setResumoLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (active) {
          setResumoLoading(false)
        }
      }
    }
    loadResumo()
    return () => {
      active = false
    }
  }, [resumoQuery, ganhos, abastecimentos, despesas, token])

  const g = useMemo(
    () => (isCustom ? filterByRange(ganhos, rangeInicio, rangeFim) : filterByPeriod(ganhos, periodo as Period)),
    [ganhos, periodo, isCustom, rangeInicio, rangeFim],
  )
  const a = useMemo(
    () => (isCustom ? filterByRange(abastecimentos, rangeInicio, rangeFim) : filterByPeriod(abastecimentos, periodo as Period)),
    [abastecimentos, periodo, isCustom, rangeInicio, rangeFim],
  )
  const d = useMemo(
    () => (isCustom ? filterByRange(despesas, rangeInicio, rangeFim) : filterByPeriod(despesas, periodo as Period)),
    [despesas, periodo, isCustom, rangeInicio, rangeFim],
  )

  const totalGanhos = resumo?.ganhos ?? sumBy(g, (x) => x.valorBruto + (x.gorjetas ?? 0))
  const totalCustos = resumo?.custos ?? (sumBy(a, (x) => x.total) + sumBy(d, (x) => x.valor))
  const lucro = resumo?.lucro ?? (totalGanhos - totalCustos)
  const km = resumo?.km ?? sumBy(g, (x) => x.km ?? 0)
  const horas = resumo?.horas ?? sumBy(g, (x) => x.horas ?? 0)
  const corridas = resumo?.corridas ?? sumBy(g, (x) => x.numCorridas ?? 0)
  const lucroPorKm = resumo ? resumo.lucroPorKm : (km > 0 ? lucro / km : null)
  const lucroPorHora = resumo ? resumo.lucroPorHora : (horas > 0 ? lucro / horas : null)

  const lucroLabel =
    periodo === 'hoje'
      ? 'Lucro do dia'
      : periodo === 'semana'
        ? 'Lucro da semana'
        : periodo === 'mes'
          ? 'Lucro do mês'
          : periodo === 'personalizado'
            ? 'Lucro do período'
            : 'Lucro total'
  const rangeLabel = isCustom ? `${formatDate(rangeInicio)} – ${formatDate(rangeFim)}` : null
  const meta =
    periodo === 'hoje'
      ? definicoes.metaDiaria
      : periodo === 'semana'
        ? definicoes.metaDiaria != null
          ? definicoes.metaDiaria * 7
          : null
        : periodo === 'mes'
          ? definicoes.metaMensal
          : null
  const metaLabel = periodo === 'hoje' ? 'diária' : periodo === 'semana' ? 'semanal' : 'mensal'
  const metaPct = meta && meta > 0 ? Math.round((lucro / meta) * 100) : 0

  // 1. Resumo por Plataforma
  const plataformaBreakdown = useMemo(() => {
    if (resumo) {
      const uberItem = resumo.plataformas.find((p) => p.plataforma === 'uber')
      const boltItem = resumo.plataformas.find((p) => p.plataforma === 'bolt')
      const outroItem = resumo.plataformas.find((p) => p.plataforma === 'outro')

      const uberVal = uberItem?.ganhos ?? 0
      const boltVal = boltItem?.ganhos ?? 0
      const outroVal = outroItem?.ganhos ?? 0
      const totalPlats = uberVal + boltVal + outroVal

      return {
        uber: { valor: uberVal, pct: totalPlats > 0 ? Math.round((uberVal / totalPlats) * 100) : 0 },
        bolt: { valor: boltVal, pct: totalPlats > 0 ? Math.round((boltVal / totalPlats) * 100) : 0 },
        outro: { valor: outroVal, pct: totalPlats > 0 ? Math.round((outroVal / totalPlats) * 100) : 0 },
        total: totalPlats,
      }
    } else {
      let uberSum = 0
      let boltSum = 0
      let outroSum = 0
      g.forEach((x) => {
        const v = x.valorBruto + (x.gorjetas ?? 0)
        if (x.plataforma === 'uber') uberSum += v
        else if (x.plataforma === 'bolt') boltSum += v
        else outroSum += v
      })
      const total = uberSum + boltSum + outroSum
      return {
        uber: { valor: uberSum, pct: total > 0 ? Math.round((uberSum / total) * 100) : 0 },
        bolt: { valor: boltSum, pct: total > 0 ? Math.round((boltSum / total) * 100) : 0 },
        outro: { valor: outroSum, pct: total > 0 ? Math.round((outroSum / total) * 100) : 0 },
        total,
      }
    }
  }, [resumo, g])

  // 2. Preços médios de combustível e eletricidade para comparação
  const precosMedios = useMemo(() => {
    const comb = abastecimentos.filter((x) => x.tipo === 'combustivel')
    const totalComb = sumBy(comb, (x) => x.total)
    const QtdComb = sumBy(comb, (x) => x.quantidade)
    const precoComb = QtdComb > 0 ? totalComb / QtdComb : 1.75 // Fallback mercado Portugal (Gasolina/Gasóleo)

    const ele = abastecimentos.filter((x) => x.tipo === 'eletrico')
    const totalEle = sumBy(ele, (x) => x.total)
    const QtdEle = sumBy(ele, (x) => x.quantidade)
    const precoEle = QtdEle > 0 ? totalEle / QtdEle : 0.25 // Fallback carregamento residencial/público médio

    return { precoComb, precoEle }
  }, [abastecimentos])

  // Estimativa do carro do motorista ou padrão de mercado
  const comparativoCombustivel = useMemo(() => {
    const combustivelCar = carros.find((c) => c.tipo !== 'eletrico')
    const eletricoCar = carros.find((c) => c.tipo === 'eletrico')

    const consumoComb = combustivelCar?.consumoMedio ?? 6.0 // L/100km padrão
    const consumoEle = eletricoCar?.consumoMedio ?? 16.0 // kWh/100km padrão

    const custoKmComb = (consumoComb * precosMedios.precoComb) / 100
    const custoKmEle = (consumoEle * precosMedios.precoEle) / 100
    const poupanca100km = (custoKmComb - custoKmEle) * 100

    return {
      combNome: combustivelCar ? `${combustivelCar.marca} (${consumoComb}L)` : 'Combustão padrão',
      eleNome: eletricoCar ? `${eletricoCar.marca} (${consumoEle}kWh)` : 'Elétrico padrão',
      custoKmComb,
      custoKmEle,
      poupanca100km,
    }
  }, [carros, precosMedios])

  // 3. Gráfico de Lucro em SVG Nativo
  const svgChart = useMemo(() => {
    if (periodo === 'hoje') {
      // Para hoje, desenhamos uma barra comparativa Ganhos vs Custos
      const maxVal = Math.max(totalGanhos, totalCustos, 1)
      const ganhosPct = (totalGanhos / maxVal) * 100
      const custosPct = (totalCustos / maxVal) * 100
      return (
        <div className="flex flex-col gap-3 py-2 px-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 font-medium"><TrendingUp className="size-3 text-emerald-500" /> Ganhos do Turno</span>
              <span className="font-semibold tabular-nums">{formatCurrency(totalGanhos)}</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${ganhosPct}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 font-medium"><TrendingDown className="size-3 text-red-500" /> Custos do Turno</span>
              <span className="font-semibold tabular-nums">{formatCurrency(totalCustos)}</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${custosPct}%` }} />
            </div>
          </div>
        </div>
      )
    }

    if (periodo === 'semana') {
      // 7 Dias (Segunda a Domingo)
      const now = new Date()
      const monday = new Date(now)
      const offset = (monday.getDay() + 6) % 7
      monday.setDate(monday.getDate() - offset)

      const weekdaysLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
      const lucrosDiarios: number[] = []

      for (let i = 0; i < 7; i++) {
        const dStr = new Date(monday)
        dStr.setDate(monday.getDate() + i)
        const dateISO = toLocalISO(dStr)

        const diaGanhos = sumBy(ganhos.filter((x) => x.data === dateISO), (x) => x.valorBruto + (x.gorjetas ?? 0))
        const diaCustos = sumBy(abastecimentos.filter((x) => x.data === dateISO), (x) => x.total) +
                          sumBy(despesas.filter((x) => x.data === dateISO), (x) => x.valor)
        lucrosDiarios.push(diaGanhos - diaCustos)
      }

      const maxLucro = Math.max(...lucrosDiarios.map(Math.abs), 20)

      return (
        <div className="flex flex-col gap-1 py-1">
          <svg className="w-full h-28" viewBox="0 0 320 110" preserveAspectRatio="none">
            {/* Center Line Y = 50 */}
            <line x1="10" y1="50" x2="310" y2="50" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3,3" />
            {lucrosDiarios.map((lucroDia, i) => {
              const x = 25 + i * 42
              const height = (Math.abs(lucroDia) / maxLucro) * 40
              const y = lucroDia >= 0 ? 50 - height : 50
              const isPositive = lucroDia >= 0
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width="20"
                    height={Math.max(height, 2)}
                    rx="3"
                    className={cn(isPositive ? 'fill-emerald-500/80 hover:fill-emerald-500' : 'fill-red-500/80 hover:fill-red-500', 'transition-all duration-300')}
                  />
                </g>
              )
            })}
          </svg>
          <div className="flex justify-between px-4 text-[10px] text-muted-foreground font-medium">
            {weekdaysLabels.map((lbl, i) => (
              <span key={i} className="w-[20px] text-center">{lbl}</span>
            ))}
          </div>
        </div>
      )
    }

    // Para Mês e Tudo, desenhamos um gráfico de linha cumulativo
    const sortedEntries = [...g, ...a, ...d].sort((a, b) => a.data.localeCompare(b.data))
    if (sortedEntries.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
          Sem dados suficientes para gerar o gráfico.
        </div>
      )
    }

    // Criar um mapa de lucro por data
    const profitByDate: { [date: string]: number } = {}
    g.forEach((x) => {
      profitByDate[x.data] = (profitByDate[x.data] || 0) + x.valorBruto + (x.gorjetas ?? 0)
    })
    a.forEach((x) => {
      profitByDate[x.data] = (profitByDate[x.data] || 0) - x.total
    })
    d.forEach((x) => {
      profitByDate[x.data] = (profitByDate[x.data] || 0) - x.valor
    })

    const dates = Object.keys(profitByDate).sort()
    if (dates.length < 2) {
      return (
        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
          Dados insuficientes para desenhar curva de tendência.
        </div>
      )
    }

    // Lucro cumulativo
    const points: { date: string; profit: number }[] = []
    dates.reduce((acc, date) => {
      const nextSum = acc + profitByDate[date]
      points.push({ date, profit: nextSum })
      return nextSum
    }, 0)

    const profits = points.map((p) => p.profit)
    const minP = Math.min(...profits, 0)
    const maxP = Math.max(...profits, 10)
    const range = maxP - minP

    // Gerar string do path SVG
    const svgWidth = 300
    const svgHeight = 80
    const pathD = points
      .map((p, i) => {
        const x = 10 + (i / (points.length - 1)) * (svgWidth - 20)
        const y = svgHeight - 10 - ((p.profit - minP) / range) * (svgHeight - 20)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')

    // Path de preenchimento (gradient)
    const fillPathD = `
      ${pathD}
      L ${(10 + svgWidth - 20).toFixed(1)} ${svgHeight.toFixed(1)}
      L 10 ${svgHeight.toFixed(1)}
      Z
    `

    const isEndingPositive = points[points.length - 1].profit >= 0

    return (
      <div className="py-2">
        <svg className="w-full h-24" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isEndingPositive ? '#10b981' : '#ef4444'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isEndingPositive ? '#10b981' : '#ef4444'} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="10" y1="10" x2={svgWidth - 10} y2="10" stroke="currentColor" strokeOpacity="0.05" />
          <line x1="10" y1="40" x2={svgWidth - 10} y2="40" stroke="currentColor" strokeOpacity="0.05" />
          <line x1="10" y1="70" x2={svgWidth - 10} y2="70" stroke="currentColor" strokeOpacity="0.05" />

          {/* Area under curve */}
          <path d={fillPathD} fill="url(#chart-grad)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            className={isEndingPositive ? 'stroke-emerald-500' : 'stroke-red-500'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex justify-between px-2 text-[9px] text-muted-foreground font-semibold">
          <span>{dates[0].split('-').reverse().slice(0, 2).join('/')}</span>
          <span>Tendência de Lucro Cumulativo</span>
          <span>{dates[dates.length - 1].split('-').reverse().slice(0, 2).join('/')}</span>
        </div>
      </div>
    )
  }, [periodo, g, a, d, totalGanhos, totalCustos, ganhos, abastecimentos, despesas])

  if (loading || resumoLoading) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <PageHeader title="Início" subtitle="Resumo financeiro" />

      <div className="mb-4">
        <JornadaDia />
      </div>

      {resumo === null && !isMock && !resumoLoading && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive-foreground animate-in fade-in duration-200">
          <span>Não foi possível carregar o resumo do servidor (dados offline).</span>
          <button 
            type="button"
            onClick={() => {
              setResumoLoading(true)
              apiFetch<Resumo>(`/resumo?${resumoQuery}`)
                .then(setResumo)
                .catch(console.error)
                .finally(() => setResumoLoading(false))
            }}
            className="font-bold underline cursor-pointer hover:opacity-80 active:scale-95 transition-all shrink-0"
          >
            Tentar de novo
          </button>
        </div>
      )}

      <Tabs value={isCustom ? '' : periodo} onValueChange={(v) => setPeriodo(v as Period)} className="mb-2">
        <TabsList className="w-full bg-muted/50 border border-border/10">
          <TabsTrigger value="hoje" className="flex-1">Hoje</TabsTrigger>
          <TabsTrigger value="semana" className="flex-1">Semana</TabsTrigger>
          <TabsTrigger value="mes" className="flex-1">Mês</TabsTrigger>
          <TabsTrigger value="tudo" className="flex-1">Tudo</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => setPeriodo(isCustom ? 'hoje' : 'personalizado')}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-medium transition-colors',
            isCustom
              ? 'border-primary/60 bg-primary/10 text-foreground'
              : 'border-border/40 bg-card/40 text-muted-foreground hover:bg-muted/30',
          )}
        >
          <CalendarRange className="size-3.5" />
          {isCustom ? 'A usar intervalo personalizado (toca para sair)' : 'Período personalizado'}
        </button>
        {isCustom ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="px-1 text-[10px] text-muted-foreground">De</label>
              <Input
                type="date"
                value={rangeInicio}
                max={rangeFim}
                onChange={(e) => setRangeInicio(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="space-y-1">
              <label className="px-1 text-[10px] text-muted-foreground">Até</label>
              <Input
                type="date"
                value={rangeFim}
                min={rangeInicio}
                onChange={(e) => setRangeFim(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Profit Card */}
      <Card className="relative overflow-hidden gap-1 p-5 border-border/40 bg-card/60 backdrop-blur-md">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{lucroLabel}</p>
            {rangeLabel ? <p className="text-[10px] text-muted-foreground/70">{rangeLabel}</p> : null}
            <p className={cn('text-3xl font-extrabold tabular-nums tracking-tight', lucro >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {formatCurrency(lucro)}
            </p>
          </div>
          <span className="p-2 bg-secondary/80 border border-border/10 rounded-xl">
            {lucro >= 0 ? <TrendingUp className="size-4 text-emerald-500" /> : <TrendingDown className="size-4 text-red-500" />}
          </span>
        </div>
        <p className="text-xs text-muted-foreground border-t border-border/30 mt-3 pt-2">
          {formatCurrency(totalGanhos)} em ganhos <span className="text-muted-foreground/45">•</span> {formatCurrency(totalCustos)} em custos
        </p>
      </Card>

      {/* Dynamic Graph Card */}
      <Card className="mt-3 p-4 border-border/40 bg-card/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Evolução no Período</span>
        </div>
        {svgChart}
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Ganhos Brutos" value={formatCurrency(totalGanhos)} sub={`${corridas} corridas registadas`} />
        <Stat label="Custos Totais" value={formatCurrency(totalCustos)} sub={`${a.length} abast. · ${d.length} despesas`} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Lucro / km" value={lucroPorKm != null ? formatCurrency(lucroPorKm) : '—'} sub={km > 0 ? `${formatNumber(km, 0)} km percorridos` : 'Sem km inseridos'} />
        <Stat label="Lucro / hora" value={lucroPorHora != null ? formatCurrency(lucroPorHora) : '—'} sub={horas > 0 ? `${formatNumber(horas, 1)} horas online` : 'Sem horas inseridas'} />
      </div>

      {resumo?.kmRodados != null ? (
        <div className="mt-3">
          <Stat
            label="Km rodados (hodómetro)"
            value={`${formatNumber(resumo.kmRodados, 0)} km`}
            sub="Soma das jornadas no período"
          />
        </div>
      ) : null}

      {/* Resumo por Plataforma */}
      <Card className="mt-3 p-4 border-border/40 bg-card/40 gap-3">
        <p className="text-xs font-semibold text-muted-foreground">Distribuição por Plataforma</p>
        {plataformaBreakdown.total > 0 ? (
          <div className="space-y-2.5">
            {/* Stacked bar */}
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex">
              <div className="h-full bg-foreground" style={{ width: `${plataformaBreakdown.uber.pct}%` }} title="Uber" />
              <div className="h-full bg-emerald-500" style={{ width: `${plataformaBreakdown.bolt.pct}%` }} title="Bolt" />
              <div className="h-full bg-muted-foreground" style={{ width: `${plataformaBreakdown.outro.pct}%` }} title="Outro" />
            </div>
            {/* Labels */}
            <div className="grid grid-cols-3 text-xs pt-1">
              <div className="flex flex-col border-r border-border/30">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-foreground inline-block" /> Uber
                </span>
                <span className="font-bold tabular-nums mt-0.5">{plataformaBreakdown.uber.pct}%</span>
                <span className="text-[10px] text-muted-foreground/75 tabular-nums">{formatCurrency(plataformaBreakdown.uber.valor)}</span>
              </div>
              <div className="flex flex-col border-r border-border/30 pl-3">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block" /> Bolt
                </span>
                <span className="font-bold tabular-nums mt-0.5">{plataformaBreakdown.bolt.pct}%</span>
                <span className="text-[10px] text-muted-foreground/75 tabular-nums">{formatCurrency(plataformaBreakdown.bolt.valor)}</span>
              </div>
              <div className="flex flex-col pl-3">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-muted-foreground inline-block" /> Outros
                </span>
                <span className="font-bold tabular-nums mt-0.5">{plataformaBreakdown.outro.pct}%</span>
                <span className="text-[10px] text-muted-foreground/75 tabular-nums">{formatCurrency(plataformaBreakdown.outro.valor)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhum ganho registado no período selecionado.</p>
        )}
      </Card>

      {/* Comparativo de Rentabilidade por Plataforma */}
      <Card className="mt-3 p-4 border-border/40 bg-card/40 gap-3">
        <p className="text-xs font-semibold text-muted-foreground">Comparativo de Rentabilidade por Plataforma</p>
        <div className="space-y-3">
          {resumo?.plataformas && resumo.plataformas.length > 0 ? (
            resumo.plataformas.map((p: any) => (
              <div key={p.plataforma} className="flex items-center justify-between border-b border-border/20 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "size-2.5 rounded-full",
                    p.plataforma === 'uber' ? 'bg-foreground' : p.plataforma === 'bolt' ? 'bg-emerald-500' : 'bg-muted-foreground'
                  )} />
                  <span className="text-xs font-medium capitalize">{p.plataforma}</span>
                </div>
                <div className="flex gap-4 text-[11px]">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Média / Hora</p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {p.ganhosPorHora != null ? formatCurrency(p.ganhosPorHora) + '/h' : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Média / Km</p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {p.ganhosPorKm != null ? formatCurrency(p.ganhosPorKm) + '/km' : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Sem dados suficientes para comparação.</p>
          )}
        </div>
      </Card>

      {/* Comparativo Combustível vs Elétrico */}
      <Card className="mt-3 p-4 border-border/40 bg-card/40 gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <RefreshCw className="size-3.5 text-emerald-500" />
          <span>Comparativo: Combustão vs Elétrico</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Fuel className="size-3 text-amber-500" /> {comparativoCombustivel.combNome}</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(comparativoCombustivel.custoKmComb)}<span className="text-[10px] font-normal text-muted-foreground">/km</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Zap className="size-3 text-emerald-500" /> {comparativoCombustivel.eleNome}</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(comparativoCombustivel.custoKmEle)}<span className="text-[10px] font-normal text-muted-foreground">/km</span></p>
          </div>
        </div>
        <div className="mt-2 text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-2.5 rounded-lg flex items-center justify-between">
          <span>Poupança estimada por cada 100 km:</span>
          <span className="font-bold tabular-nums">{formatCurrency(Math.max(comparativoCombustivel.poupanca100km, 0))}</span>
        </div>
      </Card>

      {/* Progress towards Goals */}
      {meta != null ? (
        <Card className="mt-3 gap-2 p-4 border-border/40 bg-card/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Progresso Meta {metaLabel}</p>
            <p className={cn('text-xs font-bold', metaPct >= 100 ? 'text-emerald-500' : 'text-foreground')}>{metaPct}%</p>
          </div>
          <Progress value={Math.min(Math.max(metaPct, 0), 100)} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>{formatCurrency(Math.max(lucro, 0))} acumulado</span>
            <span>Meta de {formatCurrency(meta)}</span>
          </div>
        </Card>
      ) : null}
    </>
  )
}
