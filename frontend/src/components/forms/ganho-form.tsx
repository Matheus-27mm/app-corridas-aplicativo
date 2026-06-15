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
import { PLATAFORMAS } from '@/lib/domain'
import { parseNum } from '@/lib/num'
import { useData } from '@/store/data'
import type { Ganho, Plataforma } from '@/types/models'

interface GanhoFormProps {
  ganho?: Ganho
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
}

export function GanhoForm({ ganho, open, onOpenChange, trigger }: GanhoFormProps) {
  const addGanho = useData((s) => s.addGanho)
  const updateGanho = useData((s) => s.updateGanho)

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const [data, setData] = useState(todayISO())
  const [plataforma, setPlataforma] = useState<Plataforma>('uber')
  const [valor, setValor] = useState('')
  const [corridas, setCorridas] = useState('')
  const [km, setKm] = useState('')
  const [horas, setHoras] = useState('')
  const [gorjetas, setGorjetas] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (ganho) {
        setData(ganho.data)
        setPlataforma(ganho.plataforma)
        setValor(String(ganho.valorBruto))
        setCorridas(ganho.numCorridas != null ? String(ganho.numCorridas) : '')
        setKm(ganho.km != null ? String(ganho.km) : '')
        setHoras(ganho.horas != null ? String(ganho.horas) : '')
        setGorjetas(ganho.gorjetas != null ? String(ganho.gorjetas) : '')
      } else {
        setData(todayISO())
        setPlataforma('uber')
        setValor('')
        setCorridas('')
        setKm('')
        setHoras('')
        setGorjetas('')
      }
    }
  }, [isOpen, ganho])

  const podeGuardar = parseNum(valor) > 0

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!podeGuardar) return

    const payload = {
      data,
      plataforma,
      valorBruto: parseNum(valor),
      numCorridas: corridas ? Math.round(parseNum(corridas)) : null,
      km: km ? parseNum(km) : null,
      horas: horas ? parseNum(horas) : null,
      gorjetas: gorjetas ? parseNum(gorjetas) : null,
    }

    try {
      if (ganho) {
        await updateGanho(ganho.id, payload)
        toast.success('Ganho atualizado')
      } else {
        await addGanho(payload)
        toast.success('Ganho adicionado')
      }
      setIsOpen(false)
    } catch {
      // Erro é tratado pelo store/data.ts
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
          <DialogTitle>{ganho ? 'Editar ganho' : 'Novo ganho'}</DialogTitle>
          <DialogDescription>Preenche os dados e guarda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Plataforma</Label>
            <Chips options={PLATAFORMAS} value={plataforma} onChange={(v) => setPlataforma(v)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor bruto (€)</Label>
            <Input inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nº corridas</Label>
              <Input inputMode="numeric" placeholder="0" value={corridas} onChange={(e) => setCorridas(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Quilómetros</Label>
              <Input inputMode="decimal" placeholder="0" value={km} onChange={(e) => setKm(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Horas</Label>
              <Input inputMode="decimal" placeholder="0" value={horas} onChange={(e) => setHoras(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Gorjetas (€)</Label>
              <Input inputMode="decimal" placeholder="0,00" value={gorjetas} onChange={(e) => setGorjetas(e.target.value)} />
            </div>
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
