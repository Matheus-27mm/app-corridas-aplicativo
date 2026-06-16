import { Edit2 } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCurrencySymbol } from '@/lib/format'
import { parseNum } from '@/lib/num'
import { useData } from '@/store/data'

export function DefinicoesForm() {
  const { definicoes, updateDefinicoes } = useData()
  const [open, setOpen] = useState(false)
  const [moeda, setMoeda] = useState('EUR')
  const [metaDiaria, setMetaDiaria] = useState('')
  const [metaMensal, setMetaMensal] = useState('')

  useEffect(() => {
    if (open) {
      setMoeda(definicoes.moeda || 'EUR')
      setMetaDiaria(definicoes.metaDiaria != null ? String(definicoes.metaDiaria) : '')
      setMetaMensal(definicoes.metaMensal != null ? String(definicoes.metaMensal) : '')
    }
  }, [open, definicoes])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    try {
      await updateDefinicoes({
        moeda,
        metaDiaria: metaDiaria ? parseNum(metaDiaria) : null,
        metaMensal: metaMensal ? parseNum(metaMensal) : null,
      })
      setOpen(false)
    } catch {
      // Erro tratado no store
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="xs" variant="ghost" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Edit2 className="size-3" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar definições</DialogTitle>
          <DialogDescription>Ajusta as tuas metas de faturação e moeda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Moeda</Label>
            <Select value={moeda} onValueChange={setMoeda}>
              <SelectTrigger className="w-full border-white/12 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl">
                <SelectValue placeholder="Escolhe uma moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="BRL">BRL (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Meta diária ({getCurrencySymbol(moeda)})</Label>
            <Input inputMode="decimal" value={metaDiaria} onChange={(e) => setMetaDiaria(e.target.value)} placeholder="80" />
          </div>
          <div className="space-y-1.5">
            <Label>Meta mensal ({getCurrencySymbol(moeda)})</Label>
            <Input inputMode="decimal" value={metaMensal} onChange={(e) => setMetaMensal(e.target.value)} placeholder="1800" />
          </div>
          <DialogFooter>
            <Button type="submit">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
