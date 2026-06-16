import { type FormEvent, useEffect, useState } from 'react'
import { LogOut, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { CarroForm } from '@/components/forms/carro-form'
import { DefinicoesForm } from '@/components/forms/definicoes-form'
import { PageHeader } from '@/components/page-header'
import { RecordRow } from '@/components/record-row'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Chips } from '@/components/chips'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { labelOf, TIPOS_COMBUSTIVEL } from '@/lib/domain'
import { formatCurrency, formatDate } from '@/lib/format'
import { todayISO, getDaysRemaining } from '@/lib/date'
import { useAuth } from '@/store/auth'
import { useData } from '@/store/data'
import { apiFetch } from '@/lib/api'
import type { Carro, TipoLembrete } from '@/types/models'

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

const LEMBRETE_TIPOS = [
  { value: 'inspecao', label: 'Inspeção' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'iuc', label: 'IUC' },
  { value: 'outro', label: 'Outro' },
]

export function MaisPage() {
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const updateProfile = useAuth((s) => s.updateProfile)
  const deleteAccount = useAuth((s) => s.deleteAccount)

  const carros = useData((s) => s.carros)
  const removeCarro = useData((s) => s.removeCarro)
  const definicoes = useData((s) => s.definicoes)

  const lembretes = useData((s) => s.lembretes)
  const addLembrete = useData((s) => s.addLembrete)
  const removeLembrete = useData((s) => s.removeLembrete)

  const [editingCarro, setEditingCarro] = useState<Carro | null>(null)
  const [carroEditOpen, setCarroEditOpen] = useState(false)

  // Perfil
  const [perfilOpen, setPerfilOpen] = useState(false)
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')

  useEffect(() => {
    if (perfilOpen && user) {
      setPrimeiroNome(user.primeiroNome ?? '')
      setSobrenome(user.sobrenome ?? '')
      setUsername(user.username ?? '')
      setEmail(user.email ?? '')
      setDataNascimento(user.dataNascimento ?? '')
    }
  }, [perfilOpen, user])

  // Lembrete
  const [lembreteOpen, setLembreteOpen] = useState(false)
  const [lembreteTipo, setLembreteTipo] = useState<TipoLembrete>('inspecao')
  const [lembreteDesc, setLembreteDesc] = useState('')
  const [lembreteData, setLembreteData] = useState(todayISO())

  // Apagar Conta
  const [apagarConfirmOpen, setApagarConfirmOpen] = useState(false)
  const [apagarRealConfirmOpen, setApagarRealConfirmOpen] = useState(false)

  // Exportar CSV
  const [exporting, setExporting] = useState<string | null>(null)

  async function guardarPerfil(e: FormEvent) {
    e.preventDefault()
    try {
      await updateProfile({
        primeiroNome,
        sobrenome,
        username,
        email,
        dataNascimento,
      })
      setPerfilOpen(false)
    } catch {
      // Erro é mostrado via toast pelo store
    }
  }

  async function guardarLembrete(e: FormEvent) {
    e.preventDefault()
    if (!lembreteDesc.trim()) return
    try {
      await addLembrete({
        tipo: lembreteTipo,
        descricao: lembreteDesc.trim(),
        data: lembreteData,
      })
      setLembreteOpen(false)
      setLembreteTipo('inspecao')
      setLembreteDesc('')
      setLembreteData(todayISO())
    } catch {
      // Erro tratado no store
    }
  }

  async function confirmarApagarConta() {
    try {
      await deleteAccount()
      setApagarRealConfirmOpen(false)
    } catch {
      // Erro tratado no store
    }
  }

  async function exportar(tipo: 'ganhos' | 'abastecimentos' | 'despesas') {
    setExporting(tipo)
    try {
      const data = await apiFetch<string>(`/export/${tipo}.csv`)
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${tipo}_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(`Exportação de ${tipo} concluída com sucesso!`)
    } catch (err: any) {
      toast.error(err.message || `Erro ao exportar ${tipo}`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <PageHeader title="Mais" subtitle="Conta, carros e definições" />

      {/* Perfil */}
      <Card className="flex flex-row items-center justify-between gap-3 p-4 border-border/40 bg-card/60">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-11">
            <AvatarFallback>{(user?.nome ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.nome ?? 'Convidado'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button size="xs" variant="outline" className="border-border/40 hover:bg-muted/30" onClick={() => setPerfilOpen(true)}>
          Editar Perfil
        </Button>
      </Card>

      {/* Dialog Editar Perfil */}
      <Dialog open={perfilOpen} onOpenChange={setPerfilOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Atualiza as informações da tua conta.</DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarPerfil} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Primeiro Nome</Label>
                <Input value={primeiroNome} onChange={(e) => setPrimeiroNome(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Sobrenome</Label>
                <Input value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nome de utilizador</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Nascimento</Label>
              <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lembretes */}
      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Lembretes</h2>
        <Dialog open={lembreteOpen} onOpenChange={setLembreteOpen}>
          <DialogTrigger asChild>
            <Button size="xs" variant="secondary" className="h-7 gap-1 text-xs">
              <Plus className="size-3" /> Lembrete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo lembrete</DialogTitle>
              <DialogDescription>Cria um lembrete para datas importantes.</DialogDescription>
            </DialogHeader>
            <form onSubmit={guardarLembrete} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Chips options={LEMBRETE_TIPOS} value={lembreteTipo} onChange={(v) => setLembreteTipo(v as TipoLembrete)} />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Input placeholder="Ex: Renovar apólice" value={lembreteDesc} onChange={(e) => setLembreteDesc(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Data limite</Label>
                <Input type="date" value={lembreteData} onChange={(e) => setLembreteData(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!lembreteDesc.trim()}>Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {lembretes.length === 0 ? (
          <Card className="p-4 text-center border-dashed bg-card/25 border-border/50 text-xs text-muted-foreground">
            Nenhum lembrete registado.
          </Card>
        ) : (
          lembretes.map((lembrete) => {
            const daysRemaining = getDaysRemaining(lembrete.data)
            const isClose = daysRemaining <= 30
            const labelTipo = LEMBRETE_TIPOS.find(t => t.value === lembrete.tipo)?.label || lembrete.tipo
            return (
              <Card key={lembrete.id} className="flex items-center justify-between p-3 border-border/40 bg-card/40">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize text-foreground">{labelTipo}</span>
                    {isClose && (
                      <Badge variant="destructive">
                        {daysRemaining < 0 ? 'Expirado' : daysRemaining === 0 ? 'Hoje' : `Faltam ${daysRemaining} dias`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{lembrete.descricao}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(lembrete.data)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 size-8 shrink-0"
                  onClick={() => {
                    if (window.confirm('Remover este lembrete?')) {
                      removeLembrete(lembrete.id)
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            )
          })
        )}
      </div>

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

      {/* Exportações */}
      <div className="mb-2 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground">Exportar Dados</h2>
      </div>
      <Card className="p-4 border-border/40 bg-card/40 space-y-3">
        <p className="text-xs text-muted-foreground">Exporta os teus dados registados para formato CSV para análise externa.</p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="xs" 
            className="h-8 border-border/40 hover:bg-muted/30"
            onClick={() => exportar('ganhos')}
            disabled={exporting !== null}
          >
            Ganhos
          </Button>
          <Button 
            variant="outline" 
            size="xs" 
            className="h-8 border-border/40 hover:bg-muted/30"
            onClick={() => exportar('abastecimentos')}
            disabled={exporting !== null}
          >
            Abast.
          </Button>
          <Button 
            variant="outline" 
            size="xs" 
            className="h-8 border-border/40 hover:bg-muted/30"
            onClick={() => exportar('despesas')}
            disabled={exporting !== null}
          >
            Despesas
          </Button>
        </div>
      </Card>

      {/* Conta e Segurança */}
      <div className="mb-2 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground">Conta e Segurança</h2>
      </div>
      <Card className="p-4 border-border/40 bg-card/40 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs text-muted-foreground">Eliminação permanente</span>
          <p className="text-sm font-medium text-foreground">Apagar a minha conta</p>
        </div>
        <Button 
          variant="outline" 
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
          onClick={() => setApagarConfirmOpen(true)}
        >
          Apagar Conta
        </Button>
      </Card>

      <Button variant="outline" className="mt-6 w-full border-border/40 hover:bg-muted/30" onClick={signOut}>
        <LogOut className="size-4" /> Terminar sessão
      </Button>

      {/* Double confirmation Dialogs for Account Deletion */}
      <AlertDialog open={apagarConfirmOpen} onOpenChange={setApagarConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar a tua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza de que desejas iniciar o processo para apagar a tua conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApagarConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => {
              setApagarConfirmOpen(false)
              setApagarRealConfirmOpen(true)
            }}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={apagarRealConfirmOpen} onOpenChange={setApagarRealConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação Crítica</AlertDialogTitle>
            <AlertDialogDescription>
              Aviso de segurança: todos os teus dados de ganhos, despesas e carros serão permanentemente apagados. Estás totalmente seguro de que pretendes apagar a tua conta definitiva?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApagarRealConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmarApagarConta}>
              Apagar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CarroForm
        carro={editingCarro ?? undefined}
        open={carroEditOpen}
        onOpenChange={setCarroEditOpen}
      />
    </>
  )
}
