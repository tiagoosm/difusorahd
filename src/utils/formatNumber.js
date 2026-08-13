export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value ?? 0)
}

// undefined = sem base de comparação (período anterior sem dados).
export function calcGrowth(current, previous) {
  if (!previous) return current > 0 ? undefined : 0
  return ((current - previous) / previous) * 100
}
