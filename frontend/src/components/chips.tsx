import type { Opcao } from '@/lib/domain'
import { cn } from '@/lib/utils'

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Opcao<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-foreground hover:bg-secondary/70',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
