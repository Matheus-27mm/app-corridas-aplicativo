import { useState } from 'react'
import { DespesaForm } from '@/components/forms/despesa-form'
import { PageHeader } from '@/components/page-header'
import { RecordRow } from '@/components/record-row'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CATEGORIAS_DESPESA, labelOf } from '@/lib/domain'
import { formatCurrency, formatDate } from '@/lib/format'
import { filterByPeriod, type Period } from '@/lib/period'
import { useData } from '@/store/data'
import type { Despesa } from '@/types/models'
import { Receipt } from 'lucide-react'

export function DespesasPage() {
  const despesas = useData((s) => s.despesas)
  const removeDespesa = useData((s) => s.removeDespesa)
  
  const [periodo, setPeriodo] = useState<Period>('tudo')
  const [editingItem, setEditingItem] = useState<Despesa | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const items = [...despesas].sort((a, b) => b.data.localeCompare(a.data))
  const filteredItems = filterByPeriod(items, periodo)

  return (
    <>
      <PageHeader
        title="Despesas"
        subtitle="Manutenção, seguro, IUC, portagens…"
        action={<DespesaForm />}
      />

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
              <Receipt className="size-5" />
            </span>
            <p className="text-sm font-medium">Sem registos neste período</p>
            <p className="text-xs text-muted-foreground">Toca em Adicionar para registar a primeira despesa.</p>
          </Card>
        ) : (
          filteredItems.map((despesa) => (
            <RecordRow
              key={despesa.id}
              badge={labelOf(CATEGORIAS_DESPESA, despesa.categoria).charAt(0)}
              title={`${labelOf(CATEGORIAS_DESPESA, despesa.categoria)} · ${formatDate(despesa.data)}`}
              subtitle={despesa.descricao ?? undefined}
              amount={formatCurrency(despesa.valor)}
              onClick={() => {
                setEditingItem(despesa)
                setEditOpen(true)
              }}
              onDelete={() => {
                if (window.confirm('Remover esta despesa?')) removeDespesa(despesa.id)
              }}
            />
          ))
        )}
      </div>

      <DespesaForm
        despesa={editingItem ?? undefined}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
