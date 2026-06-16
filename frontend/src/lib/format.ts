import { parseLocalDate } from '@/lib/date'
import { LOCALE, MOEDA_PADRAO } from '@/lib/domain'

let currentCurrency = MOEDA_PADRAO

export function setMoeda(currency: string) {
  currentCurrency = currency
}

export function getCurrencySymbol(currency: string = currentCurrency): string {
  try {
    const formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency })
    const parts = formatter.formatToParts(0)
    const symbolPart = parts.find((part) => part.type === 'currency')
    return symbolPart ? symbolPart.value : currency
  } catch {
    return currency
  }
}

export function formatCurrency(value: number, currency: string = currentCurrency): string {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

export function formatNumber(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}
