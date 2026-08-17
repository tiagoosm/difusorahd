import { MapPin } from 'lucide-react'
import { formatNumber } from '../../../utils/formatNumber'
import EmptyState from '../../ui/EmptyState'

const TOP_N = 5

function LocationBreakdown({ byLocation, loading }) {
  if (loading) {
    return <div className="h-56 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  if (byLocation.length === 0) {
    return <EmptyState icon={MapPin} title="Sem dados de localização no período" />
  }

  const total = byLocation.reduce((sum, row) => sum + Number(row.views), 0)
  const top = byLocation.slice(0, TOP_N)
  const restViews = byLocation.slice(TOP_N).reduce((sum, row) => sum + Number(row.views), 0)

  const rows = restViews > 0 ? [...top, { city: 'Outros', views: restViews }] : top

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => {
        const pct = total > 0 ? (Number(row.views) / total) * 100 : 0
        return (
          <li key={row.city} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-700">{row.city}</span>
              <span className="font-medium text-ink-900">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
      <li className="pt-1 text-xs text-ink-500">{formatNumber(total)} visualizações com localização identificada</li>
    </ul>
  )
}

export default LocationBreakdown
