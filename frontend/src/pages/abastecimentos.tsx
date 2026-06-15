import { useState } from 'react'
import { AbastecimentoForm } from '@/components/forms/abastecimento-form'
import { PageHeader } from '@/components/page-header'
import { RecordRow } from '@/components/record-row'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { labelOf, TIPOS_ABASTECIMENTO } from '@/lib/domain'
import { formatCurrency, formatDate } from '@/lib/format'
import { filterByPeriod, type Period } from '@/lib/period'
import { useData } from '@/store/data'
import type { Abastecimento } from '@/types/models'
import { Fuel } from 'lucide-react'

export function AbastecimentosPage() {
  const abastecimentos = useData((s) => s.abastecimentos)
  const removeAbastecimento = useData((s) => s.removeAbastecimento)
  
  const [periodo, setPeriodo] = useState<Period>('tudo')
  const [editingItem, setEditingItem] = useState<Abastecimento | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const items = [...abastecimentos].sort((a, b) => b.data.localeCompare(a.data))
  const filteredItems = filterByPeriod(items, periodo)

  return (
    <>
      <PageHeader
        title="Abastecimentos"
        subtitle="Combustível e carregamentos"
        action={<AbastecimentoForm />}
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
              <Fuel className="size-5" />
            </span>
            <p className="text-sm font-medium">Sem registos neste período</p>
            <p className="text-xs text-muted-foreground">Toca em Adicionar para registar o primeiro abastecimento.</p>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const unidade = item.tipo === 'eletrico' ? 'kWh' : 'L'
            return (
              <RecordRow
                key={item.id}
                badge={labelOf(TIPOS_ABASTECIMENTO, item.tipo).charAt(0)}
                title={`${labelOf(TIPOS_ABASTECIMENTO, item.tipo)} · ${formatDate(item.data)}`}
                subtitle={`${item.quantidade} ${unidade} · ${formatCurrency(item.precoUnitario)}/${unidade}`}
                amount={formatCurrency(item.total)}
                onClick={() => {
                  setEditingItem(item)
                  setEditOpen(true)
                }}
                onDelete={() => {
                  if (window.confirm('Remover este abastecimento?')) removeAbastecimento(item.id)
                }}
              />
            )
          })
        )}
      </div>

      <AbastecimentoForm
        abastecimento={editingItem ?? undefined}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
