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
import { TIPOS_COMBUSTIVEL } from '@/lib/domain'
import { parseNum } from '@/lib/num'
import { useData } from '@/store/data'
import type { Carro, TipoCombustivel } from '@/types/models'

interface CarroFormProps {
  carro?: Carro
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
}

export function CarroForm({ carro, open, onOpenChange, trigger }: CarroFormProps) {
  const addCarro = useData((s) => s.addCarro)
  const updateCarro = useData((s) => s.updateCarro)

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [ano, setAno] = useState('')
  const [matricula, setMatricula] = useState('')
  const [tipo, setTipo] = useState<TipoCombustivel>('gasolina')
  const [consumo, setConsumo] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (carro) {
        setMarca(carro.marca)
        setModelo(carro.modelo)
        setAno(String(carro.ano))
        setMatricula(carro.matricula)
        setTipo(carro.tipo)
        setConsumo(carro.consumoMedio != null ? String(carro.consumoMedio) : '')
      } else {
        setMarca('')
        setModelo('')
        setAno('')
        setMatricula('')
        setTipo('gasolina')
        setConsumo('')
      }
    }
  }, [isOpen, carro])

  const unidade = tipo === 'eletrico' ? 'kWh/100km' : 'L/100km'
  const podeGuardar = marca.trim().length > 0 && modelo.trim().length > 0

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!podeGuardar) return

    const payload = {
      marca,
      modelo,
      ano: ano ? Math.round(parseNum(ano)) : new Date().getFullYear(),
      matricula,
      tipo,
      consumoMedio: consumo ? parseNum(consumo) : null,
    }

    try {
      if (carro) {
        await updateCarro(carro.id, payload)
        toast.success('Carro atualizado')
      } else {
        await addCarro(payload)
        toast.success('Carro adicionado')
      }
      setIsOpen(false)
    } catch {
      // Erro tratado no store
    }
  }

  const showTrigger = trigger !== undefined ? trigger : (
    <Button size="sm" variant="secondary">
      <Plus className="size-4" /> Carro
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && <DialogTrigger asChild>{showTrigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{carro ? 'Editar carro' : 'Novo carro'}</DialogTitle>
          <DialogDescription>Preenche os dados e guarda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input placeholder="Tesla" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input placeholder="Model 3" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input inputMode="numeric" placeholder="2022" value={ano} onChange={(e) => setAno(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Matrícula</Label>
              <Input placeholder="AA-12-BB" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Chips options={TIPOS_COMBUSTIVEL} value={tipo} onChange={setTipo} />
          </div>
          <div className="space-y-1.5">
            <Label>Consumo médio ({unidade})</Label>
            <Input inputMode="decimal" placeholder="0" value={consumo} onChange={(e) => setConsumo(e.target.value)} />
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
