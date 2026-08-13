export const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last7', label: 'Últimos 7 dias' },
  { value: 'last30', label: 'Últimos 30 dias' },
  { value: 'last90', label: 'Últimos 90 dias' },
  { value: 'thisyear', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
]

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function daysAgo(days, from = new Date()) {
  const result = startOfDay(from)
  result.setDate(result.getDate() - days)
  return result
}

// Para cada período, devolve o intervalo atual [start, end) e o intervalo
// anterior equivalente (mesma duração, imediatamente antes) — usado nos
// cards de comparação (item 12). `end` é sempre exclusivo.
export function getPeriodRange(period, custom = {}) {
  const now = new Date()

  switch (period) {
    case 'today': {
      const start = startOfDay(now)
      const previousStart = daysAgo(1, now)
      return { start, end: now, previousStart, previousEnd: start }
    }
    case 'yesterday': {
      const end = startOfDay(now)
      const start = daysAgo(1, now)
      const previousStart = daysAgo(2, now)
      return { start, end, previousStart, previousEnd: start }
    }
    case 'last30': {
      const start = daysAgo(30, now)
      const previousStart = daysAgo(60, now)
      return { start, end: now, previousStart, previousEnd: start }
    }
    case 'last90': {
      const start = daysAgo(90, now)
      const previousStart = daysAgo(180, now)
      return { start, end: now, previousStart, previousEnd: start }
    }
    case 'thisyear': {
      const start = new Date(now.getFullYear(), 0, 1)
      const previousStart = new Date(now.getFullYear() - 1, 0, 1)
      const previousEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return { start, end: now, previousStart, previousEnd }
    }
    case 'custom': {
      const start = custom.from ? startOfDay(new Date(custom.from)) : daysAgo(7, now)
      const end = custom.to ? new Date(new Date(custom.to).setHours(23, 59, 59, 999)) : now
      const durationMs = end.getTime() - start.getTime()
      const previousEnd = start
      const previousStart = new Date(start.getTime() - durationMs)
      return { start, end, previousStart, previousEnd }
    }
    case 'last7':
    default: {
      const start = daysAgo(7, now)
      const previousStart = daysAgo(14, now)
      return { start, end: now, previousStart, previousEnd: start }
    }
  }
}
