import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber } from '../../../utils/formatNumber'
import { CHART_GRID_COLOR, CHART_AXIS_COLOR } from '../../../utils/chartColors'

function formatBucketLabel(isoValue, bucket) {
  const date = new Date(isoValue)
  if (bucket === 'hour') {
    return `${String(date.getHours()).padStart(2, '0')}h`
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function TooltipContent({ active, payload, bucket }) {
  if (!active || !payload?.length) return null
  const { bucket: rawBucket, views, visitors } = payload[0].payload

  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-ink-900">{formatBucketLabel(rawBucket, bucket)}</p>
      <p className="text-ink-500">{formatNumber(views)} visualizações</p>
      <p className="text-ink-500">{formatNumber(visitors)} visitantes</p>
    </div>
  )
}

function EvolutionChart({ data, bucket, loading }) {
  if (loading) {
    return <div className="h-72 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-ink-500">
        Sem dados de acesso no período selecionado.
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="evolutionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-600)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="bucket"
            tickFormatter={(value) => formatBucketLabel(value, bucket)}
            tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
            axisLine={{ stroke: CHART_GRID_COLOR }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatNumber}
            width={40}
          />
          <Tooltip content={<TooltipContent bucket={bucket} />} />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--color-brand-600)"
            strokeWidth={2}
            fill="url(#evolutionFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EvolutionChart
