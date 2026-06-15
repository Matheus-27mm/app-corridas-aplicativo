import { useState } from 'react'
import { GanhoForm } from '@/components/forms/ganho-form'
import { PageHeader } from '@/components/page-header'
import { RecordRow } from '@/components/record-row'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { labelOf, PLATAFORMAS } from '@/lib/domain'
import { formatCurrency, formatDate } from '@/lib/format'
import { filterByPeriod, type Period } from '@/lib/period'
import { useData } from '@/store/data'
import type { Ganho } from '@/types/models'
import { Wallet } from 'lucide-react'

export function GanhosPage() {
  const ganhos = useData((s) => s.ganhos)
  const removeGanho = useData((s) => s.removeGanho)
  
  const [periodo, setPeriodo] = useState<Period>('tudo')
  const [editingItem, setEditingItem] = useState<Ganho | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const items = [...ganhos].sort((a, b) => b.data.localeCompare(a.data))
  const filteredItems = filterByPeriod(items, periodo)

  return (
    <>
      <PageHeader title="Ganhos" subtitle="Corridas Uber, Bolt e outras" action={<GanhoForm />} />

      <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Period)} className="mb-4">
        <TabsList className="w-full bg-muted/50 border border-border/10">
          <TabsTrigger value="hoje" className="flex-1">Hoje</TabsTrigger>
          <TabsTrigger value="semana" className="flex-1">Semana</TabsTrigger>
          <TabsTrigger value="mes" className="flex-1">Mês</TabsTrigger>
          <TabsTrigger value="tudo" className="flex-1">Tudo</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-6 text-center gap-2 border-dashed bg-card/20 border-border/60">
            <span className="p-3 bg-secondary/80 border border-border/10 rounded-full text-muted-foreground">
              <Wallet className="size-5" />
            </span>
            <p className="text-sm font-medium">Sem registos neste período</p>
            <p className="text-xs text-muted-foreground">Toca em Adicionar para registar o primeiro ganho.</p>
          </Card>
        ) : (
          filteredItems.map((ganho) => (
            <RecordRow
              key={ganho.id}
              badge={labelOf(PLATAFORMAS, ganho.plataforma).charAt(0)}
              title={`${labelOf(PLATAFORMAS, ganho.plataforma)} · ${formatDate(ganho.data)}`}
              subtitle={[
                ganho.numCorridas != null ? `${ganho.numCorridas} corridas` : null,
                ganho.km != null ? `${ganho.km} km` : null,
                ganho.horas != null ? `${ganho.horas} h` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              amount={formatCurrency(ganho.valorBruto + (ganho.gorjetas ?? 0))}
              onClick={() => {
                setEditingItem(ganho)
                setEditOpen(true)
              }}
              onDelete={() => {
                if (window.confirm('Remover este ganho?')) removeGanho(ganho.id)
              }}
            />
          ))
        )}
      </div>

      <GanhoForm
        ganho={editingItem ?? undefined}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
