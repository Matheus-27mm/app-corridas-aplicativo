import { parseLocalDate } from '@/lib/date'

export type Period = 'hoje' | 'semana' | 'mes' | 'tudo'

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Início da semana (segunda-feira), à meia-noite local.
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const offset = (x.getDay() + 6) % 7 // domingo=0 → 6, segunda=1 → 0
  x.setDate(x.getDate() - offset)
  return x
}

export function filterByPeriod<T extends { data: string }>(items: T[], period: Period): T[] {
  if (period === 'tudo') return items
  const now = new Date()
  return items.filter((item) => {
    const d = parseLocalDate(item.data)
    if (period === 'hoje') return isSameDay(d, now)
    if (period === 'semana') {
      const start = startOfWeek(now)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)
      return d >= start && d < end
    }
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
}

// Filtro por intervalo de datas inclusivo (ISO 'AAAA-MM-DD' compara como string).
export function filterByRange<T extends { data: string }>(
  items: T[],
  inicio: string,
  fim: string,
): T[] {
  return items.filter((item) => item.data >= inicio && item.data <= fim)
}

export function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + selector(item), 0)
}
