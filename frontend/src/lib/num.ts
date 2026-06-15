/** Converte texto (vírgula ou ponto decimal) num número; 0 se inválido. */
export function parseNum(value: string): number {
  const n = parseFloat(value.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
