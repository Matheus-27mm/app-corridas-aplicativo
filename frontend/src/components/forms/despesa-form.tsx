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
import { CATEGORIAS_DESPESA } from '@/lib/domain'
import { parseNum } from '@/lib/num'
import { useData } from '@/store/data'
import type { CategoriaDespesa, Despesa } from '@/types/models'

interface DespesaFormProps {
  despesa?: Despesa
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
}

export function DespesaForm({ despesa, open, onOpenChange, trigger }: DespesaFormProps) {
  const addDespesa = useData((s) => s.addDespesa)
  const updateDespesa = useData((s) => s.updateDespesa)

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const [data, setData] = useState(todayISO())
  const [categoria, setCategoria] = useState<CategoriaDespesa>('manutencao')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (despesa) {
        setData(despesa.data)
        setCategoria(despesa.categoria)
        setDescricao(despesa.descricao ?? '')
        setValor(String(despesa.valor))
      } else {
        setData(todayISO())
        setCategoria('manutencao')
        setDescricao('')
        setValor('')
      }
    }
  }, [isOpen, despesa])

  const podeGuardar = parseNum(valor) > 0

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!podeGuardar) return

    const payload = {
      data,
      categoria,
      descricao: descricao || null,
      valor: parseNum(valor),
    }

    try {
      if (despesa) {
        await updateDespesa(despesa.id, payload)
        toast.success('Despesa atualizada')
      } else {
        await addDespesa(payload)
        toast.success('Despesa adicionada')
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
          <DialogTitle>{despesa ? 'Editar despesa' : 'Nova despesa'}</DialogTitle>
          <DialogDescription>Preenche os dados e guarda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Chips options={CATEGORIAS_DESPESA} value={categoria} onChange={(v) => setCategoria(v)} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input placeholder="Opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor (€)</Label>
            <Input inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
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
