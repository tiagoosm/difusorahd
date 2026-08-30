export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value ?? 0)
}

// undefined = no basis for comparison (previous period has no data).
export function calcGrowth(current, previous) {
  if (!previous) return current > 0 ? undefined : 0
  return ((current - previous) / previous) * 100
}
