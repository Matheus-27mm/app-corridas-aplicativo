import { useState } from 'react'
import { LogOut } from 'lucide-react'

import { CarroForm } from '@/components/forms/carro-form'
import { DefinicoesForm } from '@/components/forms/definicoes-form'
import { PageHeader } from '@/components/page-header'
import { RecordRow } from '@/components/record-row'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { labelOf, TIPOS_COMBUSTIVEL } from '@/lib/domain'
import { formatCurrency } from '@/lib/format'
import { useAuth } from '@/store/auth'
import { useData } from '@/store/data'
import type { Carro } from '@/types/models'

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function MaisPage() {
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const carros = useData((s) => s.carros)
  const removeCarro = useData((s) => s.removeCarro)
  const definicoes = useData((s) => s.definicoes)

  const [editingCarro, setEditingCarro] = useState<Carro | null>(null)
  const [carroEditOpen, setCarroEditOpen] = useState(false)

  return (
    <>
      <PageHeader title="Mais" subtitle="Conta, carros e definições" />

      {/* Perfil */}
      <Card className="flex flex-row items-center gap-3 p-4 border-border/40 bg-card/60">
        <Avatar className="size-11">
          <AvatarFallback>{(user?.nome ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.nome ?? 'Convidado'}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </Card>

      {/* Carros */}
      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Carros</h2>
        <CarroForm />
      </div>
      <div className="space-y-3">
        {carros.length === 0 ? (
          <Card className="p-4 text-center border-dashed bg-card/25 border-border/50 text-xs text-muted-foreground">
            Nenhum carro registado. Adiciona um para calcular o custo/km.
          </Card>
        ) : (
          carros.map((carro) => (
            <RecordRow
              key={carro.id}
              badge={carro.marca.charAt(0)}
              title={`${carro.marca} ${carro.modelo} (${carro.ano})`}
              subtitle={`${carro.matricula} · ${labelOf(TIPOS_COMBUSTIVEL, carro.tipo)}${
                carro.consumoMedio != null
                  ? ` · ${carro.consumoMedio} ${carro.tipo === 'eletrico' ? 'kWh' : 'L'}/100km`
                  : ''
              }`}
              onClick={() => {
                setEditingCarro(carro)
                setCarroEditOpen(true)
              }}
              onDelete={() => {
                if (window.confirm('Remover este carro?')) removeCarro(carro.id)
              }}
            />
          ))
        )}
      </div>

      {/* Definições */}
      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Definições</h2>
        <DefinicoesForm />
      </div>
      <Card className="gap-2 p-4 border-border/40 bg-card/40">
        <Linha label="Moeda" value={definicoes.moeda} />
        <Linha
          label="Meta diária"
          value={definicoes.metaDiaria != null ? formatCurrency(definicoes.metaDiaria) : '—'}
        />
        <Linha
          label="Meta mensal"
          value={definicoes.metaMensal != null ? formatCurrency(definicoes.metaMensal) : '—'}
        />
      </Card>

      <Button variant="outline" className="mt-6 w-full border-border/40 hover:bg-muted/30" onClick={signOut}>
        <LogOut className="size-4" /> Terminar sessão
      </Button>

      <CarroForm
        carro={editingCarro ?? undefined}
        open={carroEditOpen}
        onOpenChange={setCarroEditOpen}
      />
    </>
  )
}
