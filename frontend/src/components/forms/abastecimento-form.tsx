import { Plus } from 'lucide-react'
import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Chips } from '@/components/chips'
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
import { todayISO } from '@/lib/date'
import { TIPOS_ABASTECIMENTO } from '@/lib/domain'
import { formatCurrency } from '@/lib/format'
import { parseNum } from '@/lib/num'
import { useData } from '@/store/data'
import type { Abastecimento, TipoAbastecimento } from '@/types/models'

interface AbastecimentoFormProps {
  abastecimento?: Abastecimento
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
}

export function AbastecimentoForm({ abastecimento, open, onOpenChange, trigger }: AbastecimentoFormProps) {
  const addAbastecimento = useData((s) => s.addAbastecimento)
  const updateAbastecimento = useData((s) => s.updateAbastecimento)

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const [data, setData] = useState(todayISO())
  const [tipo, setTipo] = useState<TipoAbastecimento>('combustivel')
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState('')
  const [kmConta, setKmConta] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (abastecimento) {
        setData(abastecimento.data)
        setTipo(abastecimento.tipo)
        setQuantidade(String(abastecimento.quantidade))
        setPreco(String(abastecimento.precoUnitario))
        setKmConta(abastecimento.kmConta != null ? String(abastecimento.kmConta) : '')
      } else {
        setData(todayISO())
        setTipo('combustivel')
        setQuantidade('')
        setPreco('')
        setKmConta('')
      }
    }
  }, [isOpen, abastecimento])

  const unidade = tipo === 'eletrico' ? 'kWh' : 'L'
  const total = parseNum(quantidade) * parseNum(preco)
  const podeGuardar = parseNum(quantidade) > 0 && parseNum(preco) > 0

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!podeGuardar) return

    const payload = {
      data,
      tipo,
      quantidade: parseNum(quantidade),
      precoUnitario: parseNum(preco),
      total,
      kmConta: kmConta ? Math.round(parseNum(kmConta)) : null,
    }

    try {
      if (abastecimento) {
        await updateAbastecimento(abastecimento.id, payload)
        toast.success('Abastecimento atualizado')
      } else {
        await addAbastecimento(payload)
        toast.success('Abastecimento adicionado')
      }
      setIsOpen(false)
    } catch {
      // Erro tratado no store
    }
  }

  const showTrigger = trigger !== undefined ? trigger : (
    <Button size="sm">
      <Plus className="size-4" /> Adicionar
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && <DialogTrigger asChild>{showTrigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{abastecimento ? 'Editar abastecimento' : 'Novo abastecimento'}</DialogTitle>
          <DialogDescription>Preenche os dados e guarda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Chips options={TIPOS_ABASTECIMENTO} value={tipo} onChange={(v) => setTipo(v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantidade ({unidade})</Label>
              <Input inputMode="decimal" placeholder="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Preço/{unidade} (€)</Label>
              <Input inputMode="decimal" placeholder="0,00" value={preco} onChange={(e) => setPreco(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
          <div className="space-y-1.5">
            <Label>Km (conta-quilómetros)</Label>
            <Input inputMode="numeric" placeholder="0" value={kmConta} onChange={(e) => setKmConta(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!podeGuardar}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
