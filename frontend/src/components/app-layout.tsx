import { Fuel, Home, Menu, Plus, Receipt, Wallet } from 'lucide-react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useData } from '@/store/data'

import { GanhoForm } from '@/components/forms/ganho-form'
import { AbastecimentoForm } from '@/components/forms/abastecimento-form'
import { DespesaForm } from '@/components/forms/despesa-form'

const TABS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/ganhos', label: 'Ganhos', icon: Wallet, end: false },
  { to: '/abastecimentos', label: 'Abast.', icon: Fuel, end: false },
  { to: '/despesas', label: 'Despesas', icon: Receipt, end: false },
  { to: '/mais', label: 'Mais', icon: Menu, end: false },
]

export function AppLayout() {
  const user = useAuth((s) => s.user)
  const checkAuth = useAuth((s) => s.checkAuth)
  const fetchData = useData((s) => s.fetchData)
  
  const [showFABMenu, setShowFABMenu] = useState(false)
  const [showGanhoModal, setShowGanhoModal] = useState(false)
  const [showAbastModal, setShowAbastModal] = useState(false)
  const [showDespesaModal, setShowDespesaModal] = useState(false)

  // Verificar sessão inicial e carregar dados
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="relative mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>

      {/* Floating Action Button (FAB) Speed Dial */}
      <div className="fixed bottom-[76px] right-4 z-30 flex flex-col items-end gap-2">
        {/* FAB Menu Options */}
        {showFABMenu && (
          <div className="flex flex-col items-end gap-2 animate-in slide-in-from-bottom-5 duration-200">
            <button
              onClick={() => {
                setShowGanhoModal(true)
                setShowFABMenu(false)
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-card p-3 text-sm font-medium text-foreground shadow-lg hover:bg-accent active:scale-95 transition-all"
            >
              <span className="text-xs bg-black/60 px-2 py-0.5 rounded text-white border border-white/10">Ganho</span>
              <Wallet className="size-4 text-emerald-500" />
            </button>
            <button
              onClick={() => {
                setShowAbastModal(true)
                setShowFABMenu(false)
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-card p-3 text-sm font-medium text-foreground shadow-lg hover:bg-accent active:scale-95 transition-all"
            >
              <span className="text-xs bg-black/60 px-2 py-0.5 rounded text-white border border-white/10">Abastecimento</span>
              <Fuel className="size-4 text-amber-500" />
            </button>
            <button
              onClick={() => {
                setShowDespesaModal(true)
                setShowFABMenu(false)
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-card p-3 text-sm font-medium text-foreground shadow-lg hover:bg-accent active:scale-95 transition-all"
            >
              <span className="text-xs bg-black/60 px-2 py-0.5 rounded text-white border border-white/10">Despesa</span>
              <Receipt className="size-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Main FAB Trigger Button */}
        <button
          onClick={() => setShowFABMenu(!showFABMenu)}
          aria-label="Registo rápido"
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-foreground text-background shadow-xl hover:opacity-90 active:scale-95 transition-all duration-300",
            showFABMenu && "rotate-45 bg-muted text-muted-foreground"
          )}
        >
          <Plus className="size-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Controlled Modals */}
      <GanhoForm open={showGanhoModal} onOpenChange={setShowGanhoModal} />
      <AbastecimentoForm open={showAbastModal} onOpenChange={setShowAbastModal} />
      <DespesaForm open={showDespesaModal} onOpenChange={setShowDespesaModal} />

      {/* Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              <tab.icon className="size-5" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
