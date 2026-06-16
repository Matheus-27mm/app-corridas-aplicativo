import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function RecordRow({
  badge,
  icon,
  title,
  subtitle,
  amount,
  onDelete,
  onClick,
}: {
  badge?: string
  icon?: ReactNode
  title: string
  subtitle?: string
  amount?: string
  onDelete?: () => void
  onClick?: () => void
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "flex flex-row items-center gap-3 p-3",
        onClick && "cursor-pointer hover:bg-muted/40 hover:border-border transition-all duration-200 active:scale-[0.99]"
      )}
    >
      {icon ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-foreground">
          {icon}
        </div>
      ) : badge ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-foreground">
          {badge}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>

      {amount ? <p className="shrink-0 text-sm font-semibold tabular-nums">{amount}</p> : null}

      {onDelete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation() // Evitar acionar a edição ao apagar
            onDelete()
          }}
          aria-label="Remover"
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </Card>
  )
}
